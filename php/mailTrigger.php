<?php
require_once("./vendor/autoload.php");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class sndMail
{
    
    private $valid = array("success" => false, "message" => "");

    public function __construct() {
        if (!session_id()) {
            session_start();
        }
    }

    private function configureMailer() {
        
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = "smtp.hostinger.com";
        $mail->Port = 587;
        $mail->SMTPAuth = true;
        $mail->Username = "contact@blackitechs.com";
        $mail->Password = "Contact@bits#737";
        $mail->setFrom("contact@blackitechs.com", "Mail From Nichekala");
        return $mail;
    }

    //mail from contact
    public function contactEnquiry($data) {
        
        $mail = $this->configureMailer();

        try {
            // Send email to enquirer
            $mail->addAddress($data['email']);
            $mail->Subject = "Your enquiry is taken into consideration - " . $data['name'];
            $mail->Body = "
            Dear {$data['name']},
    
            Thank you for reaching out to Nichekala. I hope this message finds you well.
    
    
            Thanks & Regards,
            Nichekala Team
            ";
    

            $mail->send();
            $this->valid['success'] = true;
            $this->valid['message'] = "Mail sent successfully to enquirer.";
        } catch (Exception $e) {
            $this->valid['message'] = "Failed to send mail to enquirer: " . $mail->ErrorInfo;
        }

        // Send email to admin
        try {

            $mail->clearAddresses(); // Clear previous recipient
            $mail->addAddress("mugirajan95@gmail.com"); // Admin's email address
            $mail->Subject = "New enquiry - " . $data['name'];
            $mail->Body = "
                Contact details:
                Name: {$data['name']} 
                Email: {$data['email']}
                Phone: {$data['phone']}
                Subject: {$data['subject']}
                Message:{$data['message']} 
            ";

            $mail->send();
            $this->valid['success'] = true;
            $this->valid['message'] = "Mail sent successfully to admin.";
        } catch (Exception $e) {
            $this->valid['message'] = "Failed to send mail to admin: " . $mail->ErrorInfo;
        }

        return $this->valid;
    }
  

}
?>
