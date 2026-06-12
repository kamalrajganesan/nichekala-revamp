<?php

require_once __DIR__ . "/vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

class sndMail
{
    private $valid = ["success" => false, "message" => ""];

    public function __construct()
    {
        // session already started by mailController.php
    }

    // ── Read env variable safely ───────────────────────────
    private function env($key)
    {
        return $_ENV[$key] ?? (getenv($key) ?: '');
    }

    // ── Configure PHPMailer ────────────────────────────────
    private function configureMailer()
    {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $this->env('SMTP_HOST');
        $mail->Port       = (int) ($this->env('SMTP_PORT') ?: 587);
        $mail->SMTPAuth   = true;
        $mail->Username   = $this->env('SMTP_USER');
        $mail->Password   = $this->env('SMTP_PASS');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->setFrom($this->env('SMTP_USER'), "Nichekala");
        $mail->isHTML(false);
        return $mail;
    }

    // ── Contact form enquiry ───────────────────────────────
    public function contactEnquiry($data)
    {
        // ── Input validation ──────────────────────────────
        if (empty($data['email']) || empty($data['name']) || empty($data['message'])) {
            $this->valid['message'] = "Required fields are missing.";
            return $this->valid;
        }

        // ── Email sanitization & validation ───────────────
        $data['email'] = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->valid['message'] = "Invalid email address.";
            return $this->valid;
        }

        $mail          = $this->configureMailer();
        $userMailSent  = false;
        $adminMailSent = false;

        // ── Send confirmation to user ─────────────────────
        try {
            $mail->clearAllRecipients();
            $mail->addAddress($data['email']);
            $mail->Subject = "Your enquiry is received - " . $data['name'];
            $mail->Body    = "
Dear {$data['name']},

Thank you for reaching out to Nichekala!

We have received your enquiry and our team will get back to you as soon as possible, usually within 24 hours.

At Nichekala, we focus on creating smart, aesthetic, and space-efficient living solutions tailored to your needs. We are excited to help you find the perfect Pocket Home solution.

If your matter is urgent, feel free to reply to this email directly.

Warm regards,
The Nichekala Team
            ";
            $mail->send();
            $userMailSent = true;
        } catch (Exception $e) {
            error_log("Nichekala - User mail failed: " . $mail->ErrorInfo);
        }

        // ── Send notification to admin ────────────────────
        try {
            $mail->clearAllRecipients();
            $mail->addAddress($this->env('ADMIN_EMAIL'));
            $mail->Subject = "New Contact Enquiry - " . $data['name'];
            $mail->Body    = "
Hello Admin,

A new enquiry has been submitted through the Nichekala website.

Contact Details:
  Name    : {$data['name']}
  Email   : {$data['email']}
  Phone   : {$data['phone']}
  Subject : {$data['subject']}

Message:
{$data['message']}

Kindly follow up with the customer at the earliest.

- Nichekala System
            ";
            $mail->send();
            $adminMailSent = true;
        } catch (Exception $e) {
            error_log("Nichekala - Admin mail failed: " . $mail->ErrorInfo);
        }

        // ── Final response (both must succeed) ────────────
        if ($userMailSent && $adminMailSent) {
            $this->valid['success'] = true;
            $this->valid['message'] = "Mails sent successfully.";
        } else {
            $this->valid['success'] = false;
            $this->valid['message'] = "Mail delivery issue. Please try again.";
        }

        return $this->valid;
    }
}
?>