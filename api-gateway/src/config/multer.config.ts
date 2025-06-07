import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";

export const multerStorage = diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});
