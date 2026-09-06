# Stage 1: Build ASP.NET Core API
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["FloreriaApi.csproj", "./"]
RUN dotnet restore "FloreriaApi.csproj"

COPY . .
RUN dotnet publish "FloreriaApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads/products

ENTRYPOINT ["dotnet", "FloreriaApi.dll"]
