# Baqueano Web Architecture

## Why

Baqueano needs one cloud-backed ecosystem where Admin publishes content once, Firestore stores it as the shared source, and Web plus Android consume compatible records.

## How

The website monorepo isolates web work from the Flutter app and keeps shared contracts in packages. Apps import only typed services and validators, so UI changes do not silently reshape records consumed by Android.

## What

Core flow:

```text
Admin -> Firestore -> Web
                  -> Android
```

Roles:

- `super_admin`: full operational control.
- `admin`: content, users, destinations, validations, and businesses.
- `host`: own business, photos, availability, and approved services.
- `explorer`: personal profile and traveler functionality only.
