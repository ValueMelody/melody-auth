# Log Management

Melody Auth provides logging capabilities for email, SMS, and sign-in activities. This helps you monitor system activity, troubleshoot issues, and maintain audit trails for security and compliance purposes.

## Overview

The logging system in Melody Auth tracks three types of activities:
- **Email Logs**: Records all outgoing emails (verification, password reset, MFA, etc.)
- **SMS Logs**: Records all SMS messages sent for MFA and verification
- **Sign-in Logs**: Records user authentication attempts with IP and geolocation data

## Enabling Logs

Logs are disabled by default for privacy and storage considerations. You can enable them individually by configuring the following settings in your `server/wrangler.toml` file:

```toml
[vars]
ENABLE_EMAIL_LOG = true
ENABLE_SMS_LOG = true
ENABLE_SIGN_IN_LOG = true
```

## Accessing Logs

Once logging is enabled, you can access logs through the Admin Panel:

1. Navigate to the Admin Panel
2. Click on **"Logs"** in the sidebar navigation
3. View the different log types based on what you have enabled

## Cleaning Old Logs
The Admin Panel provides a "Clean" button for each log type that allows you to:
- Remove logs older than 30 days
- Free up database storage
- Maintain compliance with data retention policies

**Warning:** Log cleanup is a permanent operation that cannot be undone. Always backup your data before cleaning logs.

#### To clean logs:
1. Navigate to the Logs page in the Admin Panel
2. Click the "Clean" button for the desired log type
3. Confirm the action in the dialog
4. All logs older than 30 days will be permanently deleted


## Best Practices

### Privacy and Compliance
- **Data Disclosure**: Always disclose data collection in your Privacy Policy
- **Regulatory Compliance**: Ensure compliance with GDPR, CCPA, and other applicable regulations
- **Retention Policies**: Implement automated cleanup schedules based on your legal requirements

### Storage Management
- **Regular Cleanup**: Set up automated cleanup processes to prevent excessive storage usage
- **Monitoring**: Monitor log volume and storage consumption
- **Archiving**: Consider archiving important logs before cleanup if needed for compliance

## S2S API Access

Logs can also be accessed programmatically through the S2S API:

- `GET /api/v1/logs/email` - Retrieve email logs
- `GET /api/v1/logs/sms` - Retrieve SMS logs  
- `GET /api/v1/logs/sign-in` - Retrieve sign-in logs
- `DELETE /api/v1/logs/email` - Clean email logs
- `DELETE /api/v1/logs/sms` - Clean SMS logs
- `DELETE /api/v1/logs/sign-in` - Clean sign-in logs
