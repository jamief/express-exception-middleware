# Express Exception Middleware

This is an Express.js middleware for handling exceptions in development mode.

It provides a customizable error page with detailed debugging information like stack trace, request details, environment variables, etc.

**Currently in beta mode**

Getting Started

Clone the repository and install dependencies:

git clone https://github.com/jamief/express-exception-middleware  
cd express-exception-middleware  
npm install  

# Example Usage

```js
import express from 'express';
import exceptionMiddleware from 'express-exception-middleware';

const app = express();

app.use(exceptionMiddleware(options));

app.listen(3000);
```

# Contributing

Contributions are welcome!  
Please open an issue if you encounter a bug or have a feature request. Pull requests are also welcome.

# Credits

For building  
maxgfr - https://github.com/maxgfr/typescript-swc-starter

Converted to typescript and refactored from  
matthisk - https://github.com/matthisk/debug-error-middleware
