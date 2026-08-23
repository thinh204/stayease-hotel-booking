import React from "react";
import HotelDetailView from "@/components/hotels/HotelDetailView";

interface HotelPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { slug } = await params;
  return <HotelDetailView slug={slug} />;
}
