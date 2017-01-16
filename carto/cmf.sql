-- Sql queries for cmf environments.
-- Replace 'CMF' to actual table name.

-- Create column for precomputed geometry coordinates in custom projection.
ALTER TABLE CMF ADD COLUMN actual_geom geometry;

-- Compute 'actual_geom' field for all rows.
UPDATE CMF
SET actual_geom = (
    SELECT
    CASE
        WHEN name != 'Honolulu' AND name != 'Anchorage'
        THEN ST_Transform(the_geom, 42303)

        WHEN name = 'Anchorage'
        THEN ST_Rotate(ST_Scale(
            ST_Transform(
                ST_Translate(
                 the_geom, 100, -56
               )
               , 3857
             )
             , 0.3
             , 0.65
           ), 0.1)
           WHEN name = 'Honolulu'
           THEN ST_Scale(
             ST_Transform(
               ST_Translate(
                 the_geom, 62, 1
               )
               , 42303
            )
            , 1.5
    	, 1.5
    )
    END AS geom
)

-- Create procedure for computing 'actual_geom' field.
CREATE OR REPLACE FUNCTION _cmf_recompute_actual_geom()
RETURNS TRIGGER AS $$
BEGIN
NEW.actual_geom = (
    SELECT
        CASE
            WHEN NEW.name != 'Honolulu' AND NEW.name != 'Anchorage'
            THEN ST_Transform(NEW.the_geom, 42303)

            WHEN NEW.name = 'Anchorage'
            THEN ST_Rotate(ST_Scale(
                ST_Transform(
                    ST_Translate(
                        NEW.the_geom, 100, -56
                    )
                    , 3857
                )
                , 0.3
                , 0.65
            ), 0.1)

            WHEN NEW.name = 'Honolulu'
            THEN ST_Scale(
                ST_Transform(
                    ST_Translate(
                        NEW.the_geom, 62, 1
                    )
                    , 42303
                )
                , 1.5
                , 1.5
            )
        END
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE trigger update_cmf_actual_geom_trigger
AFTER UPDATE OR INSERT ON CMF
FOR EACH ROW
EXECUTE PROCEDURE _cmf_recompute_actual_geom();