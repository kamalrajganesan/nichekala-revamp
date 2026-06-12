<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/phpmailer/phpmailer/src/Exception.php';
require __DIR__ . '/phpmailer/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/phpmailer/src/SMTP.php';

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

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'soundarya.ramesh0712@gmail.com';  // ← paste from Mailtrap
    $mail->Password   = 'ojlgaiurwglxxmtz';  // ← paste from Mailtrap
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('soundarya.ramesh0712@gmail.com', 'Nichekala Website');
    $mail->addAddress('info@nichekala.in');
    $mail->isHTML(true);
    $mail->Subject = "New Enquiry: $subject from $name";
    $mail->Body    = "<b>Name:</b> $name<br><b>Email:</b> $email<br><b>Phone:</b> $phone<br><b>Subject:</b> $subject<br><b>Message:</b><br>" . nl2br($message);

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Message sent!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $mail->ErrorInfo]);
}
exit;