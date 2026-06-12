<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/phpmailer/src/Exception.php';
require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';

function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$phone   = clean($_POST['phone']   ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = clean($_POST['message'] ?? '');

if (!$name || !$email || !$phone || !$subject || !$message) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

// ── Gmail SMTP Config ──────────────────────────────
$gmail_user     = 'your@gmail.com';       // ← your Gmail
$gmail_password = 'xxxx xxxx xxxx xxxx';  // ← Gmail App Password
$admin_email    = 'info@nichekala.in';

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $gmail_user;
    $mail->Password   = $gmail_password;
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom($gmail_user, 'Nichekala Website');
    $mail->addAddress($admin_email);
    $mail->addReplyTo($email, $name);
    $mail->isHTML(true);
    $mail->Subject = "New Enquiry: $subject — from $name";
    $mail->Body    = "<b>Name:</b> $name<br><b>Email:</b> $email<br><b>Phone:</b> $phone<br><b>Subject:</b> $subject<br><b>Message:</b><br>" . nl2br($message);

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Message sent!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Mailer error: ' . $mail->ErrorInfo]);
}
exit;