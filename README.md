# DFuel 🏭

A comprehensive digital learning and booking platform for industrial machines and equipment. Learn, get certified, and book access to 3D printers, CNC machines, laser cutters, and other advanced manufacturing equipment through an integrated educational and reservation system.

## 🎯 Overview

DFuel revolutionizes access to industrial equipment by combining education with practical application. Users can learn about various industrial machines through interactive courses, take certification quizzes, and upon passing, gain booking privileges to use the actual equipment. The platform includes comprehensive admin tools for monitoring usage, managing equipment, and tracking user progress.

## ✨ Key Features

### 📚 Learning Management System
- **Interactive Courses**: Step-by-step tutorials for each machine type
- **Video Tutorials**: HD video content with expert instructors
- **Safety Training**: Comprehensive safety protocols and procedures
- **Progressive Learning**: Structured learning paths from beginner to advanced
- **Practice Simulations**: Virtual machine operation simulations

### 📝 Assessment & Certification
- **Quiz System**: Machine-specific knowledge assessments
- **Practical Exams**: Hands-on skill evaluations
- **Certification Levels**: Bronze, Silver, Gold, and Expert certifications
- **Progress Tracking**: Real-time learning progress monitoring
- **Certificate Management**: Digital certificates with verification

### 📅 Booking & Reservation System
- **Real-time Availability**: Live equipment status and availability
- **Smart Scheduling**: Intelligent booking suggestions based on usage patterns
- **Project Management**: Link bookings to specific projects
- **Queue Management**: Automated waiting list and notifications
- **Usage Analytics**: Personal usage statistics and history

### 🛠️ Equipment Management
- **Machine Inventory**: Comprehensive database of available equipment
- **Maintenance Tracking**: Scheduled maintenance and service records
- **Usage Monitoring**: Real-time equipment status and utilization
- **Safety Compliance**: Equipment safety checks and certifications
- **Resource Planning**: Capacity planning and optimization

### 👨‍💼 Admin Dashboard
- **User Management**: Complete user lifecycle management
- **Equipment Monitoring**: Real-time status of all machines
- **Analytics & Reports**: Comprehensive usage and performance analytics
- **Content Management**: Course and quiz content administration
- **System Configuration**: Platform settings and customization

## 🏭 Supported Equipment

### 3D Printing
- **FDM Printers**: Ultimaker, Prusa, Ender series
- **SLA Printers**: Formlabs, Anycubic Photon
- **Industrial Printers**: Stratasys, Markforged
- **Materials**: PLA, ABS, PETG, Resin, Metal filaments

### CNC Machining
- **CNC Mills**: 3-axis and 5-axis milling machines
- **CNC Lathes**: Turning and threading operations
- **CNC Routers**: Wood and composite material cutting
- **CAD/CAM Software**: Fusion 360, Mastercam, SolidWorks

### Laser Systems
- **Laser Cutters**: CO2 and fiber laser cutting
- **Laser Engravers**: Material marking and engraving
- **Material Compatibility**: Wood, acrylic, metal, fabric
- **Vector/Raster**: Both cutting and engraving capabilities

### Electronics & PCB
- **Pick & Place Machines**: Surface mount component assembly
- **Reflow Ovens**: PCB soldering and assembly
- **PCB Mills**: Prototype PCB manufacturing
- **Testing Equipment**: Oscilloscopes, multimeters, function generators

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [User Guide](#user-guide)
- [Admin Guide](#admin-guide)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🔧 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB or PostgreSQL
- Redis (for session management)
- FFmpeg (for video processing)
- Docker (recommended for production)

### Development Setup
```bash
# Clone the repository
git clone https://github.com/BelalIoT21/dfuel.git
cd dfuel

# Install dependencies
npm install

# Setup client
cd client
npm install
cd ..

# Setup server
cd server
npm install
cd ..

# Install admin dashboard
cd admin
npm install
cd ..
```

### Environment Configuration
```bash
# Copy environment files
cp .env.example .env
cp client/.env.example client/.env
cp server/.env.example server/.env
cp admin/.env.example admin/.env

# Edit configuration files
nano .env
```

### Database Setup
```bash
# Initialize database
npm run db:init

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Create admin user
npm run create-admin
```

## 🚀 Quick Start

### Development Mode
```bash
# Start all services
npm run dev

# Or start services individually
npm run dev:client    # Frontend (port 3000)
npm run dev:server    # Backend API (port 5000)
npm run dev:admin     # Admin dashboard (port 3001)
```

### Production Mode
```bash
# Build all applications
npm run build

# Start production server
npm run start

# Or use PM2
npm run start:prod
```

### Docker Setup
```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

## 👤 User Guide

### Getting Started
1. **Register Account**: Create your user account
2. **Complete Profile**: Add personal and educational information
3. **Choose Learning Path**: Select equipment you want to learn
4. **Take Courses**: Complete interactive learning modules
5. **Pass Assessments**: Take quizzes and practical exams
6. **Get Certified**: Receive digital certificates
7. **Book Equipment**: Reserve machines for your projects

### Learning Process
```
Registration → Profile Setup → Course Selection → Learning → Quizzes → Certification → Booking Access
```

### Course Structure
```
📚 Machine Fundamentals
├── 📖 Introduction & Safety
├── 🎥 Operation Basics
├── 🛠️ Hands-on Practice
├── ⚙️ Maintenance & Troubleshooting
└── 📝 Final Assessment
```

## 👨‍💼 Admin Guide

### Dashboard Overview
The admin dashboard provides comprehensive monitoring and management capabilities:

```
📊 Admin Dashboard
├── 👥 User Management
│   ├── User Accounts
│   ├── Progress Tracking
│   ├── Certification Management
│   └── Access Control
├── 🏭 Equipment Management
│   ├── Machine Inventory
│   ├── Maintenance Schedules
│   ├── Usage Analytics
│   └── Booking Management
├── 📚 Content Management
│   ├── Course Creation
│   ├── Quiz Management
│   ├── Video Upload
│   └── Resource Library
├── 📈 Analytics & Reports
│   ├── Usage Statistics
│   ├── Learning Analytics
│   ├── Equipment Utilization
│   └── Revenue Reports
└── ⚙️ System Settings
    ├── Platform Configuration
    ├── Notification Settings
    ├── Security Settings
    └── Integration Management
```

### Admin Features
- **Real-time Monitoring**: Live equipment status and user activity
- **User Analytics**: Detailed learning progress and performance metrics
- **Equipment Analytics**: Utilization rates and maintenance tracking
- **Content Management**: Course creation and quiz builder tools
- **Report Generation**: Automated reports and data exports
- **System Configuration**: Platform settings and customization options

## 🔗 API Documentation

### Authentication
```javascript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Response
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "student",
    "certifications": []
  }
}
```

### Course Management
```javascript
// Get available courses
GET /api/courses

// Get course details
GET /api/courses/:courseId

// Enroll in course
POST /api/courses/:courseId/enroll

// Track progress
POST /api/courses/:courseId/progress
{
  "moduleId": "module_id",
  "completed": true,
  "timeSpent": 1800
}
```

### Quiz System
```javascript
// Get quiz questions
GET /api/quizzes/:quizId

// Submit quiz answers
POST /api/quizzes/:quizId/submit
{
  "answers": [
    { "questionId": "q1", "answer": "A" },
    { "questionId": "q2", "answer": "B" }
  ]
}

// Get quiz results
GET /api/quizzes/:quizId/results
```

### Booking System
```javascript
// Get equipment availability
GET /api/equipment/:equipmentId/availability

// Create booking
POST /api/bookings
{
  "equipmentId": "equipment_id",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "projectDescription": "3D printing prototype"
}

// Get user bookings
GET /api/bookings/user/:userId
```

### Admin APIs
```javascript
// Get system statistics
GET /api/admin/stats

// Manage users
GET /api/admin/users
POST /api/admin/users/:userId/certify
DELETE /api/admin/users/:userId

// Equipment management
GET /api/admin/equipment
POST /api/admin/equipment
PUT /api/admin/equipment/:equipmentId
```

## ⚙️ Configuration

### Environment Variables
```env
# Application
NODE_ENV=production
PORT=3000
APP_NAME=DFuel
BASE_URL=https://dfuel.example.com

# Database
DATABASE_URL=mongodb://localhost:27017/dfuel
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# File Storage
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=100MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,mp4,mov

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@dfuel.com
SMTP_PASS=your-email-password

# Payment (if applicable)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Monitoring
ENABLE_LOGGING=true
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn

# Features
ENABLE_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_BOOKING_REMINDERS=true
QUIZ_PASS_THRESHOLD=80
MAX_BOOKING_DURATION=4
```

### Machine Configuration
```javascript
// config/machines.js
module.exports = {
  machines: {
    '3d-printer-ultimaker': {
      name: 'Ultimaker S3',
      category: '3d-printing',
      requiredCertification: 'bronze',
      maxBookingHours: 8,
      materials: ['PLA', 'ABS', 'PETG'],
      specifications: {
        buildVolume: '230 x 190 x 200 mm',
        layerHeight: '0.1 - 0.4 mm',
        nozzleSize: '0.4 mm'
      }
    },
    'cnc-mill-haas': {
      name: 'Haas VF-2',
      category: 'cnc-machining',
      requiredCertification: 'silver',
      maxBookingHours: 4,
      materials: ['Aluminum', 'Steel', 'Brass'],
      specifications: {
        travelX: '762 mm',
        travelY: '406 mm',
        travelZ: '508 mm',
        spindle: '7500 RPM'
      }
    }
  }
};
```

## 🐳 Deployment

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  dfuel-app:
    image: dfuel:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/dfuel
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=dfuel

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dfuel-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dfuel
  template:
    metadata:
      labels:
        app: dfuel
    spec:
      containers:
      - name: dfuel
        image: dfuel:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: dfuel-secrets
              key: database-url
```

### AWS Deployment
```bash
# Using AWS Elastic Beanstalk
eb init dfuel-platform
eb create dfuel-production
eb deploy

# Using AWS ECS
aws ecs create-cluster --cluster-name dfuel-cluster
aws ecs create-service --cluster dfuel-cluster --service-name dfuel-service
```

## 📊 Analytics & Monitoring

### Metrics Tracked
- User engagement and learning progress
- Equipment utilization rates
- Quiz performance and pass rates
- Booking patterns and peak usage times
- Course completion rates
- System performance and uptime

### Dashboard Widgets
```
📈 Analytics Dashboard
├── 👥 Active Users (Real-time)
├── 🏭 Equipment Status
├── 📚 Course Progress
├── 📝 Quiz Results
├── 📅 Booking Trends
└── 💰 Revenue Metrics
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Structure
```
tests/
├── unit/
│   ├── auth.test.js
│   ├── courses.test.js
│   ├── bookings.test.js
│   └── quizzes.test.js
├── integration/
│   ├── api.test.js
│   ├── database.test.js
│   └── booking-flow.test.js
└── e2e/
    ├── user-journey.test.js
    ├── admin-workflow.test.js
    └── certification-process.test.js
```

## 🛡️ Security

### Security Features
- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: AES encryption for sensitive data
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting and DDoS protection
- **Audit Logging**: Complete audit trail for all actions

### Security Best Practices
```javascript
// Example security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## 🤝 Contributing

We welcome contributions from the community!

### Development Workflow
```bash
# Fork the repository
git clone https://github.com/yourusername/dfuel.git

# Create feature branch
git checkout -b feature/new-machine-support

# Make changes and test
npm run test
npm run lint

# Commit and push
git commit -m "Add support for new laser cutter model"
git push origin feature/new-machine-support

# Create pull request
```

### Contribution Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Include detailed description of changes

### Code Style
```bash
# Run linting
npm run lint

# Format code
npm run prettier

# Type checking (if using TypeScript)
npm run type-check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Belal IoT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **Educational Partners**: Universities and makerspaces using the platform
- **Equipment Manufacturers**: Ultimaker, Haas, Formlabs for technical support
- **Open Source Libraries**: Express.js, React, MongoDB, Redis
- **Community Contributors**: Developers, educators, and users worldwide

## 📞 Contact & Support

**Developer**: Belal IoT  
**GitHub**: [@BelalIoT21](https://github.com/BelalIoT21)  
**Project**: [DFuel Repository](https://github.com/BelalIoT21/dfuel)

### Support Channels
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/BelalIoT21/dfuel/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/BelalIoT21/dfuel/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/BelalIoT21/dfuel/wiki)
- 💬 **Community Chat**: [Discord Server](https://discord.gg/dfuel)

### Enterprise Support
For enterprise deployments, custom integrations, or commercial licensing, please contact us through GitHub or create a discussion thread.

---

## 🎓 Getting Started for New Users

1. **Sign Up** → Create your account
2. **Explore Courses** → Browse available machine training
3. **Start Learning** → Complete interactive tutorials
4. **Take Quizzes** → Prove your knowledge
5. **Get Certified** → Earn your machine certifications
6. **Book Equipment** → Reserve time on real machines
7. **Create Projects** → Build amazing things!

⭐ **Star this repository if DFuel helped you learn and create!**

*Empowering makers through education and access to industrial equipment* 🚀
