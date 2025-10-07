# Event Manager

A modern, full-stack event management application built with Next.js, React, and AWS Lambda.

## Features

### 🎯 **Frontend Features**
- **Events Calendar**: Beautiful calendar view with live event data from webhook
- **Event Creation**: Create events with auto-generated IDs and time ranges
- **Glassmorphism UI**: Modern liquid glass modal overlays
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Feedback**: Loading states, success/error messages

### ⚡ **Backend Features**
- **AWS Lambda Function**: Serverless event management API
- **DynamoDB Integration**: NoSQL database for event storage
- **API Gateway**: RESTful endpoints with CORS support
- **Auto-generated IDs**: Unique partition keys for each event
- **Input Validation**: Comprehensive server-side validation

### 🛠 **Tech Stack**
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Python 3.11, AWS Lambda, DynamoDB
- **Infrastructure**: AWS API Gateway, Terraform (optional)
- **Deployment**: Vercel (Frontend), AWS (Backend)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- AWS CLI (for backend deployment)

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd createevent

# Install dependencies
npm install

# Set up environment variables
# Copy .env.local and update with your API endpoint
NEXT_PUBLIC_API_ENDPOINT=https://your-api-gateway-url/prod/eventcalendar

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

### Create Event
```bash
POST https://xsg0riey7e.execute-api.us-east-1.amazonaws.com/prod/eventcalendar
Content-Type: application/json

{
  "title": "Event Title",
  "description": "Event description",
  "date": "2025-12-25",
  "time": "10:00 AM - 2:00 PM",
  "location": "Event Location",
  "link": "https://example.com"
}
```

### Delete Event
```bash
DELETE https://xsg0riey7e.execute-api.us-east-1.amazonaws.com/prod/eventcalendar
Content-Type: application/json

{
  "id": "event_abc123def456"
}
```

## Project Structure

```
├── src/
│   ├── app/
│   │   └── page.tsx           # Main application page
│   ├── components/
│   │   ├── EventForm.tsx      # Event creation form
│   │   └── EventsCalendar.tsx # Calendar view component
│   ├── config/
│   │   └── api.ts            # API configuration
│   └── types/
│       └── event.ts          # TypeScript interfaces
├── backend/
│   ├── lambda_function.py    # Main Lambda function
│   ├── requirements.txt      # Python dependencies
│   └── terraform/           # Infrastructure as code
└── README.md
```

## Features in Detail

### Event Creation
- Time range picker with AM/PM formatting
- Auto-generated unique IDs as partition keys
- Real-time form validation
- Success/error feedback

### Events Calendar
- Monthly calendar grid view
- Event preview with truncated titles
- Liquid glass modal overlays
- Mobile-responsive design

### Backend API
- CORS-enabled endpoints
- Input validation and sanitization
- Error handling with appropriate HTTP codes
- DynamoDB integration with efficient queries

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy automatically

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
