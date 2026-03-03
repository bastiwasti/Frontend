# Acceptance Tests

Tests to verify after implementing new features.

**Important Note on Geocoding:** When using Nominatim API for city geocoding, always append ", Germany" to city names to avoid getting coordinates for cities with similar names in other countries (e.g., "Burscheid" vs "Bourscheid" in France). This ensures accurate coordinates for German cities.

## Distance Calculation

**Feature:** Road distance calculation between cities

### Verification Steps:
1. Verify database has records in `city_road_distances` table:
   ```bash
   psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SET search_path TO webscraper; SELECT COUNT(*) FROM city_road_distances;"
   ```
2. Check sample distances are populated:
   ```bash
   psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SET search_path TO webscraper; SELECT * FROM city_road_distances LIMIT 5;"
   ```
3. Verify API returns distances: Visit `/api/city-road-distances` with home city parameter
4. Check distances are displayed in UI on events page and calendar modal
5. Verify distance filtering works (walking <1km, biking <10km, all)

### Expected Results:
- `city_road_distances` table contains entries
- API returns valid distance data in kilometers
- UI shows distances for each event/location
- Distance filters properly filter events

## Per-User Star/Rating System

**Feature:** Per-user event star ratings with individual + average display

### Database Setup:
1. Verify `event_ratings` table exists:
   ```bash
   psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SET search_path TO webscraper; SELECT COUNT(*) FROM event_ratings;"
   ```
2. Verify table schema has correct primary key `(user_email, event_id)`:
   ```bash
   psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SET search_path TO webscraper; \d event_ratings"
   ```

### Rating Flow:
3. Open any event detail modal — label should say "Your Rating:" (not just "Rating:")
4. Click on stars to rate an event
5. Check browser console for errors
6. Verify rating is persisted in `event_ratings` with your email:
   ```bash
   psql -h localhost -U jobsearch_readonly -d vmpostgres -c "SET search_path TO webscraper; SELECT * FROM event_ratings LIMIT 10;"
   ```
7. Click the same star again to clear the rating
8. Verify rating row is deleted from `event_ratings`

### Average Display:
9. After rating an event, confirm "Avg: X.X (1 rating)" appears below the stars in the event details modal
10. Rate the same event from a second user account — average should update (e.g., "Avg: 3.5 (2 ratings)")
11. Check that day events modal shows both the user's small star rating and "Avg: X.X (N)" text

### Auth & API:
12. Rating API requires authentication — unauthenticated requests return 401:
    ```bash
    curl -s -o /dev/null -w "%{http_code}" -X PATCH http://localhost:3000/api/events/1/rating -H "Content-Type: application/json" -d '{"rating": 5}'
    ```
    Expected: `401`
13. API response includes aggregate data:
    ```json
    { "success": true, "user_rating": 5, "avg_rating": 5.0, "rating_count": 1 }
    ```

### Persistence:
14. Refresh the page — your rating and the average persist (fetched per-user from API)
15. Events API returns `user_rating`, `avg_rating`, `rating_count` fields (not the old `rating` field)

### Expected Results:
- Stars are interactive and respond to clicks
- No errors in browser console
- Ratings stored in `event_ratings` table per user (keyed by email)
- Each user sees only their own interactive rating
- Average rating and count displayed when any ratings exist
- Unauthenticated API calls return 401
- Rating persists across page refreshes
- Clearing rating deletes the row from `event_ratings`
- Old `events_distinct.rating` column is no longer used by the app
