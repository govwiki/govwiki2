SELECT *
FROM (
  SELECT *, (data_json::json->>'2014')::float AS data FROM california
)
AS california_zero_data
WHERE data=0;