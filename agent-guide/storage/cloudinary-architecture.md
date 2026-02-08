# Cloudinary Storage Architecture

## Overview

OneVault uses Cloudinary as the underlying object storage for user documents, images, and other assets. This replaces traditional S3 storage to leverage Cloudinary's optimization and secure delivery features.

## Architecture

We use a **Provider Pattern** to abstract Cloudinary SDK logic from the business logic.

```
src/shared/providers/cloudinary/
├── cloudinary.provider.ts      # Main service class
├── cloudinary.interface.ts     # Interfaces for uploads/results
└── cloudinary.constants.ts     # Config constants
```

## Data Flow

1. **Upload Request**: Client sends `multipart/form-data` to `POST /documents/upload`.
2. **Interceptor**: `FileInterceptor` (Multer) processes the incoming stream.
3. **Provider**: `CloudinaryProvider` streams the file to Cloudinary.
4. **Result**: Cloudinary returns a secure URL (`https://res.cloudinary.com/...`).
5. **Persistence**: Backend stores the URL and metadata (size, type) in the `Document` and `DocumentVersion` tables.

## Security

- **Environment Variables**: API keys are stored in `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Access Control**: Public URLs are generated, but sensitive documents can be restricted using signed URLs (future enhancement).
- **Validation**: File types and sizes are validated at the Controller level before upload.

## Extensibility

To switch to S3 or another provider:

1. Create `S3Provider` implementing a common `IStorageProvider` interface.
2. Update `DocumentsService` to inject `IStorageProvider`.
