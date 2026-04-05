import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  tokens: {
    type: [{ token: String }],
    select: false,
  },
});

export default model('User', userSchema);
