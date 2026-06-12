<?php
/**
 * send-mail.php
 * Place this file in your website ROOT (same folder as contact.html)
 * 
 * Requires: PHP with mail() enabled, OR swap the mail() call
 *           for PHPMailer/SMTP if your host blocks mail().
 */

header('Content-Type: application/json');

// ── Allow only POST ────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// ── Sanitize Inputs ────────────────────────────────────────────────────────────
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$phone   = clean($_POST['phone']   ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = clean($_POST['message'] ?? '');

// ── Server-side Validation ─────────────────────────────────────────────────────
if (!$name || !$email || !$phone || !$subject || !$message) {
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}

if (!preg_match('/^[0-9]{7,15}$/', $phone)) {
    echo json_encode(['success' => false, 'message' => 'Invalid phone number.']);
    exit;
}

// ── Configuration ──────────────────────────────────────────────────────────────
$admin_email    = 'info@nichekala.in';       // Admin receives enquiry here
$from_email     = 'noreply@nichekala.in';    // Sender shown in email headers
$from_name      = 'Nichekala Website';

// ══════════════════════════════════════════════════════════════════════════════
// 1.  EMAIL TO ADMIN
// ══════════════════════════════════════════════════════════════════════════════
$admin_subject = "New Enquiry: $subject — from $name";

$admin_body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .wrapper { max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #000; padding: 30px; text-align: center; }
    .header h1 { color: #c8157b; margin: 0; font-size: 26px; letter-spacing: 2px; }
    .header p  { color: #aaa; margin: 5px 0 0; font-size: 13px; }
    .body { padding: 30px; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px; letter-spacing: 1px; }
    .field p { margin: 0; font-size: 15px; color: #222; line-height: 1.5; }
    .divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    .footer { background: #f9f9f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #aaa; }
  </style>
</head>
<body>
  <div class='wrapper'>
    <div class='header'>
      <h1>NICHEKALA<span style='color:#c8157b;'>.</span></h1>
      <p>New Contact Form Submission</p>
    </div>
    <div class='body'>
      <div class='field'>
        <label>Name</label>
        <p>$name</p>
      </div>
      <hr class='divider'>
      <div class='field'>
        <label>Email</label>
        <p><a href='mailto:$email' style='color:#c8157b;'>$email</a></p>
      </div>
      <hr class='divider'>
      <div class='field'>
        <label>Phone</label>
        <p>$phone</p>
      </div>
      <hr class='divider'>
      <div class='field'>
        <label>Subject</label>
        <p>$subject</p>
      </div>
      <hr class='divider'>
      <div class='field'>
        <label>Message</label>
        <p>" . nl2br($message) . "</p>
      </div>
    </div>
    <div class='footer'>
      This email was sent via the contact form at <a href='https://nichekala.in' style='color:#c8157b;'>nichekala.in</a>
    </div>
  </div>
</body>
</html>
";

$admin_headers  = "MIME-Version: 1.0\r\n";
$admin_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$admin_headers .= "From: $from_name <$from_email>\r\n";
$admin_headers .= "Reply-To: $name <$email>\r\n";   // Admin can reply directly to user

$admin_sent = mail($admin_email, $admin_subject, $admin_body, $admin_headers);

// ══════════════════════════════════════════════════════════════════════════════
// 2.  CONFIRMATION EMAIL TO USER
// ══════════════════════════════════════════════════════════════════════════════
$user_subject = "We've received your message — Nichekala";

$user_body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .wrapper { max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #000; padding: 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; letter-spacing: 2px; }
    .header span { color: #c8157b; }
    .body { padding: 30px; color: #333; line-height: 1.7; font-size: 15px; }
    .body h2 { color: #000; font-size: 20px; margin-top: 0; }
    .highlight { background: #f9f9f9; border-left: 4px solid #c8157b; padding: 15px 20px; margin: 20px 0; border-radius: 0 6px 6px 0; }
    .highlight p { margin: 6px 0; font-size: 14px; color: #555; }
    .highlight strong { color: #000; }
    .cta { text-align: center; margin: 30px 0; }
    .cta a { background: #c8157b; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 14px; letter-spacing: 1px; }
    .footer { background: #f9f9f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #aaa; }
    .social a { color: #c8157b; text-decoration: none; margin: 0 8px; }
  </style>
</head>
<body>
  <div class='wrapper'>
    <div class='header'>
      <h1>NICHEKALA<span>.</span></h1>
    </div>
    <div class='body'>
      <h2>Hi $name,</h2>
      <p>Thank you for reaching out to <strong>Nichekala Architecture &amp; Design Studio</strong>. We've successfully received your message and our team will get back to you within <strong>1–2 business days</strong>.</p>

      <div class='highlight'>
        <p><strong>Your Enquiry Details</strong></p>
        <p><strong>Subject:</strong> $subject</p>
        <p><strong>Phone:</strong> $phone</p>
        <p><strong>Message:</strong><br>" . nl2br($message) . "</p>
      </div>

      <p>In the meantime, feel free to explore our latest work on our website or reach out to us directly:</p>
      <ul>
        <li>📧 <a href='mailto:info@nichekala.in' style='color:#c8157b;'>info@nichekala.in</a></li>
        <li>📞 <a href='tel:+919600156838' style='color:#c8157b;'>+91 9600156838</a></li>
        <li>📍 283, Mohanram Nagar, Mogappair West, Chennai – 600037</li>
      </ul>

      <div class='cta'>
        <a href='https://nichekala.in/portfolio.html'>View Our Portfolio</a>
      </div>

      <p style='color:#999; font-size:13px;'>If you did not submit this form, please ignore this email.</p>
    </div>
    <div class='footer'>
      <div class='social'>
        <a href='https://www.facebook.com/people/Nichekala/100065317878556/'>Facebook</a> |
        <a href='https://www.instagram.com/nichekala_official/'>Instagram</a>
      </div>
      <p style='margin-top:10px;'>© 2025 Nichekala. All Rights Reserved.<br>283, Mohanram Nagar, Mogappair West, Chennai – 600037</p>
    </div>
  </div>
</body>
</html>
";

$user_headers  = "MIME-Version: 1.0\r\n";
$user_headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$user_headers .= "From: Nichekala <$from_email>\r\n";

$user_sent = mail($email, $user_subject, $user_body, $user_headers);

// ── Response ────────────────────────────────────────────────────────────────────
if ($admin_sent) {
    echo json_encode(['success' => true, 'message' => 'Form successfully submitted!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please try again or contact us directly.']);
}
exit;