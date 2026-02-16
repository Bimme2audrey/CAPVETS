import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Media from '@/lib/models/Media';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ publicId: string }> }
) {
  try {
    await connectDB();

    const { publicId } = await context.params;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    await cloudinary.uploader.destroy(`capvets/${publicId}`);

    // Delete from database
    await Media.findOneAndDelete({ public_id: `capvets/${publicId}` });

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully"
    });

  } catch (error: any) {
    console.error('Media deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
