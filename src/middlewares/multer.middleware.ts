import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });

// Multer in Node.js/Express

/*
Multer is a middleware for handling multipart/form-data, which is primarily used to uploading files in Node.js and Express applications. it's robust library that simplifies file uploads by attaching the files to the request object (req.file) or (req.files) during http requests made to the server.

Understanding the role of multer is crucial for building web applications that allows users to upload files, such as images, documents, and videos. It supports both single file and multi file uploads, and it gives you control over where the files are stored(either in-memory or on disk), what file are accepted, and the limits of file size or field lengths.

When uploading files through HTML forms, you set the enctype attribute of the form to multipart/form-data. Multer parses this form data and attaches it to the request object (req.file)

*/
