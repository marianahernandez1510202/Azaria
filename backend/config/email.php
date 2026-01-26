<?php

return [
    'driver' => $_ENV['MAIL_DRIVER'] ?? 'smtp',
    'host' => $_ENV['MAIL_HOST'] ?? 'smtp.sendgrid.net',
    'port' => $_ENV['MAIL_PORT'] ?? 587,
    'username' => $_ENV['MAIL_USERNAME'] ?? '',
    'password' => $_ENV['MAIL_PASSWORD'] ?? '',
    'encryption' => 'tls',
    'from' => [
        'address' => $_ENV['MAIL_FROM_ADDRESS'] ?? 'no-reply@vitalia.app',
        'name' => $_ENV['MAIL_FROM_NAME'] ?? 'Vitalia'
    ],
    'support' => [
        'email' => $_ENV['SUPPORT_EMAIL'] ?? 'ayuda@vitalia.app',
        'phone' => $_ENV['SUPPORT_PHONE'] ?? '442-XXX-XXXX'
    ]
];
