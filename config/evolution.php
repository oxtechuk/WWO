<?php

/**
 * Evolution API Configuration
 * Mirrors Wox-Ox .env structure for compatibility.
 */
return [

    'server' => [
        'name' => env('SERVER_NAME', 'wox-lv'),
        'type' => env('SERVER_TYPE', 'http'),
        'port' => (int) env('SERVER_PORT', 8001),
        'url' => env('SERVER_URL', 'http://localhost:8001'),
    ],

    'bridge' => [
        'url' => env('EVOLUTION_BRIDGE_URL', null),
        'timeout' => (int) env('EVOLUTION_BRIDGE_TIMEOUT', 30),
    ],

    'authentication' => [
        'api_key' => env('AUTHENTICATION_API_KEY', ''),
        'expose_in_fetch_instances' => (bool) env('AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES', true),
    ],

    'cors' => [
        'origin' => env('CORS_ORIGIN', '*'),
        'methods' => env('CORS_METHODS', 'GET,POST,PUT,DELETE'),
        'credentials' => (bool) env('CORS_CREDENTIALS', true),
    ],

    'database' => [
        'save_instance' => (bool) env('DATABASE_SAVE_DATA_INSTANCE', true),
        'save_new_message' => (bool) env('DATABASE_SAVE_DATA_NEW_MESSAGE', true),
        'save_message_update' => (bool) env('DATABASE_SAVE_MESSAGE_UPDATE', true),
        'save_contacts' => (bool) env('DATABASE_SAVE_DATA_CONTACTS', true),
        'save_chats' => (bool) env('DATABASE_SAVE_DATA_CHATS', true),
        'save_labels' => (bool) env('DATABASE_SAVE_DATA_LABELS', true),
        'save_historic' => (bool) env('DATABASE_SAVE_DATA_HISTORIC', true),
        'save_is_on_whatsapp' => (bool) env('DATABASE_SAVE_IS_ON_WHATSAPP', true),
        'is_on_whatsapp_days' => (int) env('DATABASE_SAVE_IS_ON_WHATSAPP_DAYS', 7),
        'delete_message' => (bool) env('DATABASE_DELETE_MESSAGE', true),
    ],

    'instance' => [
        'del_instance' => env('DEL_INSTANCE', false),
    ],

    'qrcode' => [
        'limit' => (int) env('QRCODE_LIMIT', 30),
        'color' => env('QRCODE_COLOR', '#175197'),
    ],

    'session' => [
        'phone_client' => env('CONFIG_SESSION_PHONE_CLIENT', 'Evolution API'),
        'phone_name' => env('CONFIG_SESSION_PHONE_NAME', 'Chrome'),
    ],

    'webhook' => [
        'global' => [
            'enabled' => (bool) env('WEBHOOK_GLOBAL_ENABLED', false),
            'url' => env('WEBHOOK_GLOBAL_URL', ''),
            'by_events' => (bool) env('WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS', false),
        ],
        'timeout_ms' => (int) env('WEBHOOK_REQUEST_TIMEOUT_MS', 60000),
        'retry_max_attempts' => (int) env('WEBHOOK_RETRY_MAX_ATTEMPTS', 10),
        'retry_initial_delay_seconds' => (int) env('WEBHOOK_RETRY_INITIAL_DELAY_SECONDS', 5),
        'retry_exponential_backoff' => (bool) env('WEBHOOK_RETRY_USE_EXPONENTIAL_BACKOFF', true),
        'retry_max_delay_seconds' => (int) env('WEBHOOK_RETRY_MAX_DELAY_SECONDS', 300),
        'retry_jitter_factor' => (float) env('WEBHOOK_RETRY_JITTER_FACTOR', 0.2),
        'retry_non_retryable_codes' => array_map('intval', explode(',', env('WEBHOOK_RETRY_NON_RETRYABLE_STATUS_CODES', '400,401,403,404,422'))),
        'events' => [
            'application_startup' => (bool) env('WEBHOOK_EVENTS_APPLICATION_STARTUP', false),
            'qrcode_updated' => (bool) env('WEBHOOK_EVENTS_QRCODE_UPDATED', true),
            'messages_set' => (bool) env('WEBHOOK_EVENTS_MESSAGES_SET', true),
            'messages_upsert' => (bool) env('WEBHOOK_EVENTS_MESSAGES_UPSERT', true),
            'messages_edited' => (bool) env('WEBHOOK_EVENTS_MESSAGES_EDITED', true),
            'messages_update' => (bool) env('WEBHOOK_EVENTS_MESSAGES_UPDATE', true),
            'messages_delete' => (bool) env('WEBHOOK_EVENTS_MESSAGES_DELETE', true),
            'send_message' => (bool) env('WEBHOOK_EVENTS_SEND_MESSAGE', true),
            'contacts_set' => (bool) env('WEBHOOK_EVENTS_CONTACTS_SET', true),
            'contacts_upsert' => (bool) env('WEBHOOK_EVENTS_CONTACTS_UPSERT', true),
            'contacts_update' => (bool) env('WEBHOOK_EVENTS_CONTACTS_UPDATE', true),
            'presence_update' => (bool) env('WEBHOOK_EVENTS_PRESENCE_UPDATE', true),
            'chats_set' => (bool) env('WEBHOOK_EVENTS_CHATS_SET', true),
            'chats_upsert' => (bool) env('WEBHOOK_EVENTS_CHATS_UPSERT', true),
            'chats_update' => (bool) env('WEBHOOK_EVENTS_CHATS_UPDATE', true),
            'chats_delete' => (bool) env('WEBHOOK_EVENTS_CHATS_DELETE', true),
            'groups_upsert' => (bool) env('WEBHOOK_EVENTS_GROUPS_UPSERT', true),
            'groups_update' => (bool) env('WEBHOOK_EVENTS_GROUPS_UPDATE', true),
            'group_participants' => (bool) env('WEBHOOK_EVENTS_GROUP_PARTICIPANTS_UPDATE', true),
            'connection_update' => (bool) env('WEBHOOK_EVENTS_CONNECTION_UPDATE', true),
            'labels_edit' => (bool) env('WEBHOOK_EVENTS_LABELS_EDIT', true),
            'labels_association' => (bool) env('WEBHOOK_EVENTS_LABELS_ASSOCIATION', true),
            'call' => (bool) env('WEBHOOK_EVENTS_CALL', true),
            'errors' => (bool) env('WEBHOOK_EVENTS_ERRORS', false),
            'errors_webhook' => env('WEBHOOK_EVENTS_ERRORS_WEBHOOK', ''),
        ],
    ],

    'whatsapp_business' => [
        'token_webhook' => env('WA_BUSINESS_TOKEN_WEBHOOK', 'evolution'),
        'url' => env('WA_BUSINESS_URL', 'https://graph.facebook.com'),
        'version' => env('WA_BUSINESS_VERSION', 'v20.0'),
        'language' => env('WA_BUSINESS_LANGUAGE', 'en_US'),
    ],

    'integrations' => [
        'typebot' => (bool) env('TYPEBOT_ENABLED', false),
        'chatwoot' => (bool) env('CHATWOOT_ENABLED', false),
        'openai' => (bool) env('OPENAI_ENABLED', false),
        'dify' => (bool) env('DIFY_ENABLED', false),
        'n8n' => (bool) env('N8N_ENABLED', false),
        'evoai' => (bool) env('EVOAI_ENABLED', false),
        'rabbitmq' => (bool) env('RABBITMQ_ENABLED', false),
        'sqs' => (bool) env('SQS_ENABLED', false),
        'kafka' => (bool) env('KAFKA_ENABLED', false),
        'pusher' => (bool) env('PUSHER_ENABLED', false),
        'websocket' => (bool) env('WEBSOCKET_ENABLED', false),
        's3' => (bool) env('S3_ENABLED', false),
    ],

    's3' => [
        'enabled' => (bool) env('S3_ENABLED', false),
        'access_key' => env('S3_ACCESS_KEY'),
        'secret_key' => env('S3_SECRET_KEY'),
        'bucket' => env('S3_BUCKET', 'evolution'),
        'port' => (int) env('S3_PORT', 443),
        'endpoint' => env('S3_ENDPOINT'),
        'region' => env('S3_REGION', 'eu-west-3'),
        'use_ssl' => (bool) env('S3_USE_SSL', true),
    ],

];
