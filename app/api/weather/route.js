export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=fr&cnt=7`
  );
  const data = await res.json();
  return Response.json(data);
}
