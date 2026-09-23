# Security Policy

## Supported versions

Security fixes are currently applied to the latest version on the `main` branch.

## Reporting a vulnerability

Please do not open a public Issue for a suspected vulnerability.

Report security problems privately to the maintainer at mohammadmahdidalirifar@gmail.com.

Include, when available:

- A short description of the issue
- Steps to reproduce it
- Affected files or features
- Expected impact
- A suggested fix, if you have one

Please avoid accessing or modifying data that does not belong to you while validating a report.

## Secrets and configuration

Do not commit private credentials, service-role keys, production tokens, or personal household data.

The Supabase anon key is a browser-facing credential. Data access must still be restricted with appropriate Supabase Row Level Security policies.
