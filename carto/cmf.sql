-- Sql queries for cmf environments.
-- Replace 'CMF' and 'CMF_TITLE' to actual table name.

-- Create column for precomputed geometry coordinates in custom projection.
ALTER TABLE CMF ADD COLUMN actual_geom geometry;
ALTER TABLE CMF_TILE ADD COLUMN actual_geom geometry;

-- Add function for computing area name of government by coordinates.
-- We simple check given geometry position relative to sets of points.
CREATE OR REPLACE FUNCTION _cmf_area_computing(geometry)
RETURNS VARCHAR(40) AS $$
BEGIN
    RETURN (
        SELECT CASE
            WHEN $1 |>> St_Point(0, 49)
            THEN 'Alaska'

            WHEN ($1 <<| St_Point(0, 25.7)) AND ($1 << St_Point(-97, 0))
            THEN 'Hawaii'

            WHEN ($1 <<| St_Point(0, 25.7)) AND ($1 >> St_Point(-97, 0))
            THEN 'Puerto Rico'

            ELSE 'USA'
        END
    );
END;
$$ LANGUAGE plpgsql;

-- Add function for computing actual coordinates in cmf projection
CREATE OR REPLACE FUNCTION _cmf_projection_compute(geometry)
RETURNS geometry AS $$
DECLARE area VARCHAR(40);
BEGIN
    SELECT _cmf_area_computing($1) INTO area;

    RETURN (
        SELECT CASE
            WHEN area = 'Alaska'
            THEN ST_Rotate(
                ST_Scale(
                    ST_Transform(
                        ST_Translate($1, 100, -56),
                        3857
                    ),
                    0.3,
                    0.65
                ),
                0.1
            )

            WHEN area = 'Hawaii'
            THEN ST_Scale(
                ST_Transform(
                    ST_Translate($1, 62, 1),
                    42303
                ),
                1.5,
                1.5
            )

            WHEN area = 'Puerto Rico'
            THEN ST_scale(
                ST_Transform(
                    St_translate($1, 0, -2.5),
                    4437
                ),
                7,
                7
            )
            WHEN area  = 'USA'
            THEN ST_Transform($1, 42303)
        END
    );
END;
$$ LANGUAGE plpgsql;


-- Compute 'actual_geom' field for all rows in data and tile tables.
UPDATE CMF
SET actual_geom = (SELECT _cmf_projection_compute(the_geom));
UPDATE CMF_TILE
SET actual_geom = (SELECT _cmf_projection_compute(the_geom));

-- Create trigger for computing 'actual_geom' field.
CREATE OR REPLACE FUNCTION _cmf_recompute_actual_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actual_geom := (SELECT _cmf_projection_compute(NEW.the_geom));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cmf_actual_geom_trigger
BEFORE UPDATE OR INSERT ON CMF
FOR EACH ROW
EXECUTE PROCEDURE _cmf_recompute_actual_geom();