<?php

require_once("./mailTrigger.php");

$sm = new sndMail();

if (isset($_POST["type"])) {

    $res = array("success" => false, "message" => "");

    // ✅ ADD MESSAGE VALIDATION HERE (BEFORE CAPTCHA CHECK)
    if (isset($_POST['message'])) {
        $message = trim($_POST['message']);
        
        // Check if message is empty after trimming
        if (empty($message)) {
            $res["success"] = false;
            $res["message"] = "Message cannot be empty or contain only spaces.";
            echo json_encode($res);
            exit;
        }
        
        // Check if message has at least 3 meaningful characters
        $nonWhitespaceChars = preg_replace('/\s+/', '', $message);
        if (strlen($nonWhitespaceChars) < 3) {
            $res["success"] = false;
            $res["message"] = "Message must contain at least 3 valid characters.";
            echo json_encode($res);
            exit;
        }
        
        // Update the POST data with trimmed message
        $_POST['message'] = $message;
    }

    // $formsWithCaptcha = ["contactForm"];

    // if (in_array($_POST["type"], $formsWithCaptcha)) {
    //     if (empty($_POST['g-recaptcha-response'])) {
    //         $res["success"] = false;
    //         $res["message"] = "Please complete the CAPTCHA.";
    //         echo json_encode($res);
    //         exit;
    //     }

        $recaptchaSecret = "6LezNRMtAAAAAPs3JCsac7iu0o_2zUvfuGUdPfXX"; 
        $recaptchaResponse = $_POST['g-recaptcha-response'];

    //     $verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret={$recaptchaSecret}&response={$recaptchaResponse}";
    //     $response = file_get_contents($verifyUrl);
    //     $responseData = json_decode($response);

    //     if (!$responseData->success) {
    //         $res["success"] = false;
    //         $res["message"] = "CAPTCHA verification failed. Please try again.";
    //         echo json_encode($res);
    //         exit;
    //     }
    // }

    switch ($_POST["type"]) {
        case "contactForm":
            $res = $sm->contactEnquiry($_POST);
            break;


        default:
            $res["success"] = false;
            $res["message"] = "Invalid request";
            break;
    }

    echo json_encode($res);
}
?>