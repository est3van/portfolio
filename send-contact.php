<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$subject = isset($data['subject']) ? trim($data['subject']) : 'Sans objet';
$message = isset($data['message']) ? trim($data['message']) : '';

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tous les champs obligatoires doivent être remplis']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Adresse email invalide']);
    exit;
}

$webhook_url = 'https://discord.com/api/webhooks/1549454739236847716/jBb_RGNIPEJFhyZaUoRjvcYprJSaHZoeB4vhRvh_Ms5ct1yFK9SwADxcXpqSjBs21yGL';

$discord_data = [
    'embeds' => [
        [
            'title' => 'Nouveau message de contact',
            'color' => 8141421,
            'fields' => [
                ['name' => 'Nom', 'value' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'), 'inline' => true],
                ['name' => 'Email', 'value' => '[' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '](mailto:' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . ')', 'inline' => true],
                ['name' => 'Sujet', 'value' => htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'), 'inline' => false],
                ['name' => 'Message', 'value' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8'), 'inline' => false]
            ],
            'footer' => ['text' => 'Portfolio - Estevan BARBAULT'],
            'timestamp' => date('c')
        ]
    ]
];

$ch = curl_init($webhook_url);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($discord_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($http_code >= 200 && $http_code < 300) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur serveur',
        'details' => $curl_error ? 'cURL Error: ' . $curl_error : 'HTTP Code: ' . $http_code
    ]);
}
?>
