const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/random-challenge', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB підключено: ${conn.connection.host}`);
    
    // Обробка помилок після підключення
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB помилка:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB відключено');
    });
    
  } catch (error) {
    console.error(`Помилка підключення до MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;