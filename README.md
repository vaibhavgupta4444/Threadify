### Threadify - Reel Sharing Platform

A modern reel sharing platform built with Next.js, allowing users to create, share, and discover short-form video content.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js
- **Media Storage**: ImageKit
- **Styling**: Tailwind CSS (assumed)
- **Database**: MongoDB


## Features

- 🎥 **Video Upload & Sharing**: Upload and share short-form video content
- 🔐 **Authentication**: Secure user authentication with NextAuth.js
- 👤 **User Profiles**: Personalized user profiles and content management
- 📱 **Responsive Design**: Mobile-first responsive design
- 🖼️ **Media Optimization**: Optimized media delivery through ImageKit
- 💾 **Data Persistence**: Robust data storage with MongoDB
- 🔍 **Content Discovery**: Browse and discover trending reels


## ️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- ImageKit account
- NextAuth.js provider credentials


### Environment Variables

Create a `.env.local` file in the root directory:

```plaintext
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth Providers (example with Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (for verification emails)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_or_email_password

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### Installation Steps

1. **Clone the repository**

```shellscript
git clone https://github.com/yourusername/threadify.git
cd threadify
```


2. **Install dependencies**

```shellscript
npm install
# or
yarn install
```


3. **Set up environment variables**

1. Copy `.env.example` to `.env.local`
2. Fill in your environment variables



4. **Run the development server**

```shellscript
npm run dev
# or
yarn dev
```


5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)


## Project Structure

```plaintext
threadify/
├── components/          # Reusable UI components
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   └── auth/          # Authentication pages
├── lib/               # Utility functions and configurations
├── models/            # MongoDB models
├── public/            # Static assets
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## Configuration

### MongoDB Setup

1. Create a MongoDB database (local or MongoDB Atlas)
2. Add your connection string to `MONGODB_URI`


### ImageKit Setup

1. Create an ImageKit account
2. Get your public key, private key, and URL endpoint
3. Add credentials to environment variables


### NextAuth Setup

1. Configure your OAuth providers
2. Set up callback URLs in your provider settings
3. Add provider credentials to environment variables


### Email Setup (Nodemailer)

The application uses Nodemailer for sending verification emails. To configure:

1. **Gmail Setup (Recommended)**:
   - Use your Gmail address for `EMAIL_USER`
   - Generate an App Password for `EMAIL_PASS`:
     - Go to Google Account settings
     - Enable 2-Factor Authentication
     - Generate an App Password for "Mail"
     - Use this App Password (not your regular password)

2. **Other Email Providers**:
   - Update the service in `lib/nodemailer.ts`
   - Supported services: Gmail, Outlook, Yahoo, etc.
   - Or use custom SMTP settings

```typescript
// Example for custom SMTP
export const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```


## Usage

1. **Sign Up/Login**: Create an account or login with OAuth providers
2. **Upload Reels**: Share your short-form video content
3. **Discover Content**: Browse and interact with other users' reels
4. **Profile Management**: Customize your profile and manage your content


## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically


### Other Platforms

- Ensure all environment variables are configured
- Build the project: `npm run build`
- Start the production server: `npm start`


## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## Acknowledgments

- Next.js team for the amazing framework
- MongoDB for reliable database solutions
- ImageKit for media optimization
- NextAuth.js for authentication solutions


## Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact: [vaibhav.ayushgupta@gmail.com](mailto:vaibhav.ayushgupta@gmail.com)


---

**Built with ❤️ using Next.js and TypeScript**