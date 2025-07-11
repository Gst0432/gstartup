import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapeRequest {
  url: string;
  options?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, options = {} }: ScrapeRequest = await req.json();
    
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API key not configured");
    }

    console.log(`Scraping URL: ${url}`);

    // Appel à l'API Firecrawl pour scraper le site
    const firecrawlResponse = await fetch("https://api.firecrawl.dev/v0/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
        formats: ["markdown", "html"],
        includeTags: ["title", "meta", "h1", "h2", "h3", "p", "img"],
        excludeTags: ["script", "style", "nav", "footer"],
        waitFor: 2000,
        ...options
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.text();
      console.error("Firecrawl API error:", errorData);
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const data = await firecrawlResponse.json();
    
    // Extraire les informations importantes
    const siteInfo = {
      url: url,
      title: data.metadata?.title || "Sans titre",
      description: data.metadata?.description || "Aucune description",
      image: data.metadata?.ogImage || data.metadata?.image || null,
      content: data.markdown || data.html || "",
      keywords: data.metadata?.keywords || [],
      scrapedAt: new Date().toISOString(),
      success: true
    };

    return new Response(JSON.stringify({
      success: true,
      data: siteInfo
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Scraping error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});