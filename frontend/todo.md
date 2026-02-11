# LeaseLens - AI Lease Contract Auditor

## Design Guidelines

### Design References
- **Notion.so**: Clean, minimal interface with excellent typography
- **Linear.app**: Modern SaaS dashboard with subtle animations
- **Style**: Professional Legal Tech + Modern SaaS

### Color Palette
- Primary: #1E3A5F (Deep Navy - trust, professionalism)
- Secondary: #F8FAFC (Light Gray - backgrounds)
- Accent: #3B82F6 (Blue - CTAs and highlights)
- Success: #10B981 (Green - completed status)
- Warning: #F59E0B (Amber - risk flags)
- Danger: #EF4444 (Red - critical risks)
- Text Primary: #1E293B (Dark slate)
- Text Secondary: #64748B (Medium gray)

### Typography
- Heading1: Inter font-weight 700 (36px)
- Heading2: Inter font-weight 600 (24px)
- Heading3: Inter font-weight 600 (18px)
- Body: Inter font-weight 400 (14px)
- Small: Inter font-weight 400 (12px)

### Key Component Styles
- **Buttons**: Blue background (#3B82F6), white text, 8px rounded, hover: darken 10%
- **Cards**: White background, subtle shadow, 12px rounded, border #E2E8F0
- **Forms**: Light inputs with border, focus: blue ring
- **Status Badges**: Rounded pills with colored backgrounds

### Images to Generate
1. **hero-lease-analysis.jpg** - Professional office desk with legal documents, laptop showing data charts, warm lighting (Style: photorealistic, professional)
2. **feature-ai-extraction.jpg** - Abstract visualization of AI analyzing documents, blue tones (Style: modern, tech)
3. **feature-calendar.jpg** - Calendar with highlighted dates, reminder notifications (Style: clean, minimal)
4. **feature-security.jpg** - Shield icon with lock, representing data security (Style: modern, professional)

---

## Development Tasks

### 1. Setup & Configuration
- [x] Initialize shadcn-ui template
- [x] Activate backend (Supabase)
- [x] Create database tables (documents, extractions, user_credits, payments)
- [x] Create storage bucket (lease-documents)
- [ ] Generate hero images

### 2. Backend Development
- [ ] Create PDF processing service with AI extraction
- [ ] Create Stripe payment routes
- [ ] Create calendar generation utility

### 3. Frontend Pages
- [ ] Landing Page (Index.tsx) - Hero, features, pricing, CTA
- [ ] Auth Callback Page
- [ ] Dashboard Page - List of documents, credits display
- [ ] Upload Page - PDF upload with drag & drop
- [ ] Report Page - Display extraction results and risks
- [ ] Pricing Page - Pricing plans with Stripe checkout
- [ ] Payment Success Page

### 4. Components
- [ ] Header with navigation and auth
- [ ] DocumentCard - Display document status
- [ ] ExtractionReport - Show extracted data
- [ ] RiskBadge - Display risk flags
- [ ] CalendarExport - Generate .ICS file
- [ ] PricingCard - Display pricing options

### 5. Integration
- [ ] Connect frontend to backend APIs
- [ ] Implement file upload to Supabase Storage
- [ ] Integrate AI extraction via backend
- [ ] Integrate Stripe payments

### 6. Final Steps
- [ ] Update index.html title and meta
- [ ] Run lint and build
- [ ] Test all flows