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

// GET all media
export async function GET() {
  try {
    await connectDB();

    const mediaItems = await Media.find().sort({ createdAt: -1 });

    return NextResponse.json({
      result: 'success',
      data: mediaItems
    });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { result: 'error', message: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST upload new media
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('media') as File;
    const description = formData.get('description') as string;
    const productType = formData.get('productType') as string;
    const chickenCategory = formData.get('chickenCategory') as string;

    if (!file) {
      return NextResponse.json(
        { result: 'error', message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve: any, reject: any) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'capvets'
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Save to database
    const media = new Media({
      url: (result as any).secure_url,
      public_id: (result as any).public_id,
      type: (result as any).resource_type === 'video' ? 'videos' : 'images',
      description: description || '',
      productType: productType || '',
      chickenCategory: chickenCategory || ''
    });

    await media.save();

    return NextResponse.json({
      result: 'success',
      data: media
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { result: 'error', message: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
