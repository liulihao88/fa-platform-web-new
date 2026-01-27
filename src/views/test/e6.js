let o1 = {
  name: "bucket1",
  value: "1010141758878801432",
  PERMISSION_BUCKET_READ: true,
  PERMISSION_BUCKET_WRITE: true,
  PERMISSION_BUCKET_DELETE: true
};

let o2 = {
  PERMISSION_BUCKET_DELETE: true,
  PERMISSION_BUCKET_DELET2: true
};

let o3 = Object.assign({}, o1, o2);
console.log(`54 o3`, o3);
console.log(`2213 17行 test/e6.js o1 `, o1);
