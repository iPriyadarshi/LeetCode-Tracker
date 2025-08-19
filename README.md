# LeetBoard

This is a Next.js application that displays a leaderboard of LeetCode performance for students. It allows uploading a CSV with student information, fetches their latest stats from LeetCode, and displays a sortable and paginated leaderboard.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have Node.js installed on your machine. It's recommended to use version 18 or later. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1.  **Clone the repository** (if you are running this outside of an integrated environment):
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies**:
    This project uses npm for package management. Run the following command in the project root to install all the necessary dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To start the application in development mode, run the following command:

```bash
npm run dev
```

This will start the development server, typically on [http://localhost:9002](http://localhost:9002). Open this URL in your browser to see the application. The server supports hot-reloading, so any changes you make to the code will be reflected in the browser automatically.

## Building for Production

To create a production-ready build of the application, run:

```bash
npm run build
```

This command compiles and optimizes the application for production. The output will be stored in the `.next` directory.

### Running the Production Server

After building the project, you can start the production server with this command:

```bash
npm run start
```

This will run the optimized version of the application, which is what you would deploy to a hosting service.

## Linting

To check the code for any linting errors and ensure code quality, you can run:

```bash
npm run lint
```
