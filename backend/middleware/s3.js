module.exports = {
  uploadToS3: async (file) => {
    console.log("⚠️ S3 desactivado – stub activo");
    return {
      Location: "https://fake-s3-url.com/image.jpg"
    };
  }
};
