import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    console.error('Proxy error: Missing URL parameter');
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  console.log('Proxying request to:', url);

  try {
    // Fetch the image from the SPC server
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`Proxy error: Failed to fetch the image with status ${response.status}`);
      return NextResponse.json({ error: `Failed to fetch image: ${response.statusText}` }, { status: response.status });
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    console.log('Successfully proxied image from SPC, size:', imageBuffer.byteLength);
    
    // Determine content type based on URL extension
    let contentType = 'image/gif'; // Default to gif since SPC uses gif images
    if (url.endsWith('.png')) {
      contentType = 'image/png';
    } else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    }
    
    // Return the image with appropriate headers
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Error fetching the image' }, { status: 500 });
  }
}