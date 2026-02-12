# Gemini API Migration Guide

## Overview

This document describes the migration from PyMuPDF-based PDF extraction to Google Gemini API for lease document analysis.

## Changes Made

### 1. New Dependency
- **Added**: `google-genai>=0.8.0` to `requirements.txt`
- **Removed**: `PyMuPDF>=1.24.0` from `requirements.txt` (now optional)

### 2. New Service: `gemini_extractor.py`
Created a new service that uses Google Gemini API to analyze PDF files directly:
- `GeminiExtractor.analyze_pdf()` - Analyzes PDF files and extracts lease data
- `GeminiExtractor.get_page_image()` - Renders PDF pages as images (fallback to PyMuPDF)
- `GeminiExtractor.get_page_count()` - Gets PDF page count (fallback to PyMuPDF)

**Key Features**:
- No local text extraction needed
- Better accuracy with AI-powered analysis
- Native PDF support in Gemini API
- Returns extracted lease data in structured format

### 3. Updated Router: `lease_analysis.py`
Modified the `/analyze` endpoint to use Gemini API:
- Replaced `DocumentExtractor` with `GeminiExtractor`
- Removed PyMuPDF text extraction logic
- Added error handling for Gemini API failures
- Source mapping is now disabled (Gemini doesn't provide coordinate info)

### 4. Updated Services

#### `pdf_extractor.py`
- Updated docstring to indicate it's now for PDF rendering only
- Made PyMuPDF import optional (for backward compatibility)
- Kept existing methods for PDF viewer functionality

#### `document_extractor.py`
- Added deprecation warnings for PDF extraction
- Updated docstrings to recommend `GeminiExtractor` for PDFs
- Kept for Word document support only

## Environment Variables

You need to set the following environment variable:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

## API Changes

### Before (PyMuPDF)
```python
# Extract text with coordinates
doc_extractor = DocumentExtractor()
doc_data = doc_extractor.extract(file_bytes, file_name)
document_text = doc_data["full_text"]
source_blocks = doc_data["blocks"]

# Use AI to extract data
extraction_service = LeaseExtractionService()
result = await extraction_service.extract_lease_data(document_text)
```

### After (Gemini API)
```python
# Analyze PDF directly with Gemini
gemini_extractor = GeminiExtractor()
analysis_result = await gemini_extractor.analyze_pdf(file_bytes, file_name)
extracted_data = analysis_result["extracted_data"]
```

## Impact on Features

### Still Working
✅ PDF analysis (now with better accuracy)
✅ Lease data extraction
✅ Compliance checking
✅ All lease management features
✅ Word document support (still uses python-docx)

### Changed Behavior
⚠️ **Source Mapping**: Coordinate-based source tracing is no longer available with Gemini API
- Previously: Click on extracted field to see location in PDF
- Now: Source tracing is disabled (source_map and pages_meta are empty)

### Optional Features (require PyMuPDF)
📄 **PDF Page Rendering**: For PDF viewer functionality
- Still works if PyMuPDF is installed
- Falls back gracefully if not installed
- Install with: `pip install PyMuPDF`

## Installation

```bash
# Install the new dependency
pip install google-genai

# Optional: Install PyMuPDF for PDF viewer
pip install PyMuPDF
```

## Testing

To test the new Gemini API integration:

1. Set up your Gemini API key
2. Upload a lease document
3. Call the `/api/v1/lease/analyze` endpoint
4. Verify the extracted data is accurate

## Troubleshooting

### "GEMINI_API_KEY environment variable is not set"
- Solution: Set the `GEMINI_API_KEY` environment variable

### "Failed to analyze PDF with Gemini"
- Check your API key is valid
- Verify you have API credits in your Google Cloud account
- Check the error logs for more details

### "PDF rendering requires PyMuPDF"
- This is for PDF viewer functionality only
- Install PyMuPDF if you need page rendering
- Document analysis still works without PyMuPDF

## Migration Checklist

- [x] Update requirements.txt with google-genai
- [x] Create GeminiExtractor service
- [x] Update lease_analysis router
- [x] Update pdf_extractor service (make optional)
- [x] Update document_extractor service (deprecation warnings)
- [x] Set GEMINI_API_KEY environment variable
- [x] Test document analysis with Gemini API
- [ ] Update deployment configuration (if applicable)
- [ ] Update documentation for end users (if source tracing was advertised)

## Notes

- The batch analysis endpoint (`/analyze-batch`) still uses the old `LeaseExtractionService` and may need updating in the future
- PyMuPDF is not removed entirely - it's optional for PDF rendering
- The lease extraction service (`LeaseExtractionService`) is still used for other parts of the application