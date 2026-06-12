<?php

if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . "/mailTrigger.php";

// ── Load .env ──────────────────────────────────────────────
$envPath = __DIR__ . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $key   = trim($key);
            $value = trim($value);
            putenv($key . '=' . $value);
            $_ENV[$key]    = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// ── Security Headers ───────────────────────────────────────
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://www.google.com https://www.gstatic.com; frame-src https://www.google.com; connect-src 'self' https://www.google.com https://www.gstatic.com");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header('Content-Type: application/json');

$res = ["success" => false, "message" => ""];

// ── 1. HONEYPOT CHECK ──────────────────────────────────────
if (!empty($_POST['website'])) {
    $res["message"] = "Bot detected.";
    echo json_encode($res);
    exit;
}

// ── 2. CSRF CHECK ──────────────────────────────────────────
if (empty($_POST['csrf_token']) ||
    !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'])) {
    $res["message"] = "Invalid request token.";
    echo json_encode($res);
    exit;
}

// ── 3. RATE LIMITING (5 submissions per 10 minutes, per IP) ──
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateDir  = __DIR__ . '/rate_limit';
$rateFile = $rateDir . '/' . md5($ip) . '.json';
$now      = time();
$window   = 600; // 10 minutes
$limit    = 5;

if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0700, true);
}

$rateData = ['count' => 0, 'start' => $now];
if (file_exists($rateFile)) {
    $raw = @file_get_contents($rateFile);
    if ($raw !== false) {
        $parsed = json_decode($raw, true);
        if (is_array($parsed) && isset($parsed['count'], $parsed['start'])) {
            $rateData = $parsed;
        }
    }
}

if ($now - $rateData['start'] > $window) {
    $rateData = ['count' => 0, 'start' => $now];
}

$rateData['count']++;
@file_put_contents($rateFile, json_encode($rateData), LOCK_EX);

if ($rateData['count'] > $limit) {
    $res["message"] = "Too many requests. Please try again after 10 minutes.";
    echo json_encode($res);
    exit;
}

// ── 4. TYPE CHECK ──────────────────────────────────────────
if (!isset($_POST["type"])) {
    $res["message"] = "Invalid request.";
    echo json_encode($res);
    exit;
}

// ── 5. MESSAGE VALIDATION ──────────────────────────────────
if (isset($_POST['message'])) {
    $message = trim($_POST['message']);

    if (empty($message)) {
        $res["message"] = "Message cannot be empty.";
        echo json_encode($res);
        exit;
    }

    if (strlen(preg_replace('/\s+/', '', $message)) < 3) {
        $res["message"] = "Message must contain at least 3 characters.";
        echo json_encode($res);
        exit;
    }

    $_POST['message'] = $message;
}

// ── 6. reCAPTCHA VERIFICATION ─────────────────────────────
$formsWithCaptcha = ["contactForm"];

if (in_array($_POST["type"], $formsWithCaptcha)) {

    if (empty($_POST['g-recaptcha-response'])) {
        $res["message"] = "Please complete the CAPTCHA.";
        echo json_encode($res);
        exit;
    }

    $secret = $_ENV['RECAPTCHA_SECRET'] ?? (getenv('RECAPTCHA_SECRET') ?: '');

    if (empty($secret)) {
        error_log("reCAPTCHA ERROR: RECAPTCHA_SECRET is not set in environment.");
        $res["message"] = "Server configuration error. Please contact support.";
        echo json_encode($res);
        exit;
    }

    $ch = curl_init("https://www.google.com/recaptcha/api/siteverify");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'secret'   => $secret,
        'response' => $_POST['g-recaptcha-response']
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $verify    = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("reCAPTCHA cURL error: " . $curlError);
        $res["message"] = "CAPTCHA check failed due to a network error. Please try again.";
        echo json_encode($res);
        exit;
    }

    $captcha = json_decode($verify);

    if ($captcha === null) {
        error_log("reCAPTCHA ERROR: Could not decode Google response: " . $verify);
        $res["message"] = "CAPTCHA verification failed. Please try again.";
        echo json_encode($res);
        exit;
    }

    if (!$captcha->success) {
        $errorCodes = isset($captcha->{'error-codes'}) ? implode(', ', $captcha->{'error-codes'}) : 'none';
        error_log("reCAPTCHA failed. Error codes: " . $errorCodes);
        $res["message"] = "CAPTCHA verification failed. Please try again.";
        echo json_encode($res);
        exit;
    }
}

// ── 7. ROUTE TO HANDLER ───────────────────────────────────
switch ($_POST["type"]) {
    case "contactForm":
        $sm  = new sndMail();
        $res = $sm->contactEnquiry($_POST);
        break;
    default:
        $res["message"] = "Invalid request type.";
        break;
}

echo json_encode($res);
?>