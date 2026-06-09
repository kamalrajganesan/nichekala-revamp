<?php

require_once("./mailTrigger.php");

$sm = new sndMail();

if (isset($_POST["type"])) {

    $res = array("success" => false, "message" => "");

    // Message validation
    if (isset($_POST['message'])) {
        $message = trim($_POST['message']);

        if (empty($message)) {
            $res["success"] = false;
            $res["message"] = "Message cannot be empty or contain only spaces.";
            echo json_encode($res);
            exit;
        }

        $nonWhitespaceChars = preg_replace('/\s+/', '', $message);
        if (strlen($nonWhitespaceChars) < 3) {
            $res["success"] = false;
            $res["message"] = "Message must contain at least 3 valid characters.";
            echo json_encode($res);
            exit;
        }

        $_POST['message'] = $message;
    }

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