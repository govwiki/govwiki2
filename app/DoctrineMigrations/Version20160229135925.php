<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160229135925 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('delete from texas where government_id not in (select * from (select min(g.id) from governments g group by g.slug) x)');
        $this->addSql('delete from governments where environment_id = 10 and id not in (select * from (select min(g.id) from governments g group by g.slug) x)');

        $this->addSql('CREATE TABLE texas_temp (id int(11), name VARCHAR(255), alt_type VARCHAR(255)) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci');
        $this->addSql('INSERT INTO texas_temp VALUES (37255, \'Cedar Hill\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37257, \'Cedar Park\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37301, \'Cibolo\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37319, \'Cleburne\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37329, \'Clute\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37343, \'Abilene\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37357, \'Alamo Heights\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37368, \'Alice\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37370, \'Allen\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37373, \'Alton\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37378, \'Alvin\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37380, \'Amarillo\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37394, \'Andrews\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37396, \'Angleton\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37417, \'Arlington\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37433, \'Athens\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37447, \'Austin\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37452, \'Azle\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37461, \'Balch Springs\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37485, \'Bay City\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37488, \'Baytown\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37493, \'Beaumont\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37497, \'Bedford\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37499, \'Beeville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37505, \'Bellaire\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37513, \'Belton\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37516, \'Benbrook\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37529, \'Big Lake\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37559, \'Boerne\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37563, \'Bonham\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37566, \'Borger\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37586, \'Brenham\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37609, \'Brownsville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37610, \'Brownwood\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37612, \'Bryan\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37626, \'Burkburnett\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37628, \'Burleson\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37663, \'Canyon\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37677, \'Carrollton\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37679, \'Huntsville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37682, \'Hurst\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37684, \'Hutto\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37716, \'Irving\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37725, \'Jacinto City\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37729, \'Jacksonville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37765, \'Katy\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37771, \'Keller\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37792, \'College Station\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37793, \'Colleyville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37817, \'Conroe\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37818, \'Converse\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37823, \'Coppell\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37824, \'Copperas Cove\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37828, \'Corinth\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37833, \'Corpus Christi\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37834, \'Corsicana\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37869, \'Crowley\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37887, \'Dallas\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37910, \'Deer Park\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37915, \'Del Rio\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37921, \'Denison\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37922, \'Denton\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37928, \'DeSoto\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37936, \'Dickinson\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37944, \'Donna\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37966, \'Dumas\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37968, \'Duncanville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37980, \'Eagle Pass\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38000, \'Edinburg\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38006, \'El Campo\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38013, \'El Paso\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38042, \'Ennis\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38060, \'Euless\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38083, \'Farmers Branch\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38118, \'Forest Hill\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38120, \'Forney\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38130, \'Fort Worth\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38141, \'Fredericksburg\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38142, \'Freeport\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38146, \'Friendswood\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38148, \'Frisco\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38157, \'Gainesville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38158, \'Galena Park\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38162, \'Galveston\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38170, \'Garland\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38175, \'Gatesville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38182, \'Georgetown\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38200, \'Glenn Heights\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38230, \'Grand Prairie\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38248, \'Grapevine\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38258, \'Greenville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38267, \'Groves\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38289, \'Haltom City\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38299, \'Harker Heights\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38301, \'Harlingen\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38340, \'Henderson\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38345, \'Hereford\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38350, \'Hewitt\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38360, \'Highland Village\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38394, \'Houston\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38404, \'Humble\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38410, \'Leander\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38418, \'Leon Valley\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38422, \'Levelland\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38427, \'Lewisville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38441, \'Little Elm\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38445, \'Live Oak\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38451, \'Lockhart\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38468, \'Longview\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38490, \'Lubbock\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38493, \'Lufkin\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38531, \'Richardson\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38538, \'Richmond\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38570, \'Robinson\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38580, \'Rockwall\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38597, \'Rosenberg\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38603, \'Round Rock\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38605, \'Rowlett\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38617, \'Sachse\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38621, \'Mansfield\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38639, \'Marshall\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38655, \'McAllen\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38662, \'McKinney\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38679, \'Mercedes\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38688, \'Mesquite\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38694, \'Midland\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38695, \'Midlothian\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38717, \'Mineral Wells\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38720, \'Mission\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38723, \'Missouri City\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38777, \'Mount Pleasant\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38795, \'Murphy\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38805, \'Nacogdoches\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38817, \'Nederland\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38826, \'New Braunfels\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38876, \'North Richland Hills\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38901, \'Odessa\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38924, \'Orange\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38953, \'Palestine\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38969, \'Paris\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38977, \'Pasadena\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38989, \'Pearland\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39008, \'Pflugerville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39009, \'Pharr\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39033, \'Plainview\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39034, \'Plano\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39061, \'Port Lavaca\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39062, \'Port Neches\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39069, \'Portland\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39122, \'Raymondville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39126, \'Red Oak\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39134, \'Kerrville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39138, \'Killeen\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39145, \'Kingsville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39160, \'Kyle\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39171, \'La Marque\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39176, \'La Porte\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39201, \'Lake Jackson\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39208, \'Lakeway\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39217, \'Lancaster\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39222, \'Laredo\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39238, \'League City\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39245, \'Saginaw\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39264, \'San Angelo\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39265, \'San Antonio\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39267, \'San Benito\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39282, \'San Juan\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39289, \'San Marcos\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39313, \'Santa Fe\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39329, \'Schertz\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39338, \'Seabrook\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39340, \'Seagoville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39351, \'Seguin\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39380, \'Sherman\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39408, \'Snyder\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39411, \'Socorro\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39436, \'Southlake\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39456, \'Stafford\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39468, \'Stephenville\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39485, \'Sugar Land\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39489, \'Sulphur Springs\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39513, \'Sweetwater\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39524, \'Taylor\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39535, \'Temple\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39540, \'Terrell Hills\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39543, \'Texarkana\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39544, \'Texas City\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39547, \'The Colony\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39569, \'Tomball\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39611, \'Tyler\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39624, \'Universal City\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39625, \'University Park\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39628, \'Uvalde\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39641, \'Vernon\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39647, \'Vidor\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39651, \'Waco\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39680, \'Watauga\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39685, \'Waxahachie\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39688, \'Weatherford\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39689, \'Webster\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39704, \'Weslaco\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39719, \'West University Place\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39744, \'White Settlement\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39750, \'Wichita Falls\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39799, \'Wylie\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (45663, \'Addison\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (45955, \'Flower Mound\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70683, \'Wichita\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70684, \'Wilbarger\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70685, \'Willacy\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70686, \'Williamson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70687, \'Wilson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70689, \'Wise\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70690, \'Wood\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70765, \'Matagorda\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70766, \'Maverick\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70767, \'Medina\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70769, \'Midland\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70773, \'Montague\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70774, \'Montgomery\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70775, \'Moore\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70778, \'Nacogdoches\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70779, \'Navarro\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70780, \'Newton\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70781, \'Nolan\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70782, \'Nueces\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70785, \'Orange\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70786, \'Palo Pinto\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70787, \'Panola\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70788, \'Parker\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70789, \'Parmer\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70790, \'Pecos\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70791, \'Polk\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70792, \'Potter\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70795, \'Randall\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70799, \'Reeves\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70803, \'Rockwall\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70804, \'Runnels\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70805, \'Rusk\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70806, \'Sabine\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70808, \'San Jacinto\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70810, \'San Patricio\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70813, \'Scurry\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70815, \'Shelby\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70817, \'Smith\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70825, \'Tarrant\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70826, \'Taylor\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70830, \'Titus\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70831, \'Tom Green\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70832, \'Travis\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70833, \'Trinity\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70835, \'Upshur\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70837, \'Uvalde\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70838, \'Val Verde\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70839, \'Van Zandt\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70840, \'Victoria\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70841, \'Walker\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70842, \'Waller\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70844, \'Washington\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70845, \'Webb\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70846, \'Wharton\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70849, \'Fort Bend\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70850, \'Franklin\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70853, \'Gaines\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70854, \'Galveston\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70856, \'Gillespie\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70859, \'Gonzales\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70860, \'Gray\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70861, \'Grayson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70862, \'Gregg\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70863, \'Grimes\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70864, \'Guadalupe\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70865, \'Hale\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70870, \'Hardin\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70871, \'Harris\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70872, \'Harrison\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70875, \'Hays\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70878, \'Hidalgo\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70879, \'Hill\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70880, \'Hockley\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70881, \'Hood\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70882, \'Hopkins\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70883, \'Houston\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70884, \'Howard\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70886, \'Hunt\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70887, \'Hutchinson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70890, \'Jackson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70891, \'Jasper\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70893, \'Jefferson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70895, \'Jim Wells\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70896, \'Johnson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70897, \'Jones\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70898, \'Karnes\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70899, \'Kaufman\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70900, \'Kendall\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70903, \'Kerr\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70907, \'Kleberg\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70910, \'Lamb\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70911, \'Lampasas\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70913, \'Lavaca\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70916, \'Liberty\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70917, \'Limestone\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70922, \'Lubbock\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70925, \'McLennan\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70936, \'Anderson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70937, \'Andrews\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70938, \'Angelina\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70939, \'Aransas\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70942, \'Atascosa\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70943, \'Austin\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70945, \'Bandera\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70946, \'Bastrop\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70948, \'Bee\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70949, \'Bell\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70950, \'Bexar\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70954, \'Bowie\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70955, \'Brazoria\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70956, \'Brazos\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70960, \'Brown\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70961, \'Burleson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70962, \'Burnet\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70963, \'Caldwell\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70964, \'Calhoun\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70966, \'Cameron\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70968, \'Cass\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70970, \'Chambers\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70971, \'Cherokee\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70977, \'Collin\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70979, \'Colorado\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70980, \'Comal\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70983, \'Cooke\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70984, \'Coryell\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70991, \'Dallas\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70992, \'Dawson\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70995, \'Denton\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70996, \'DeWitt\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (71001, \'Eastland\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (71002, \'Ector\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (71004, \'Ellis\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (71005, \'El Paso\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (71006, \'Erath\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (71008, \'Fannin\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (71009, \'Fayette\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (37677, \'Carrollton\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38083, \'Farmers Branch\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38394, \'Houston\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38531, \'Richardson\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (38662, \'McKinney\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39034, \'Plano\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39524, \'Taylor\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39535, \'Temple\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39647, \'Vidor\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (39799, \'Wylie\', \'City\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70853, \'Gaines\', \'County\')');
        $this->addSql('INSERT INTO texas_temp VALUES (70871, \'Harris\', \'County\')');

        $this->addSql('UPDATE governments set slug = TRIM(REPLACE(slug, \'_County\', \'\')), name = TRIM(REPLACE(name, \' County\', \'\')) where name like \'%County\' and environment_id = (select id from environments where name like \'texas\')');

        $this->addSql('CREATE TABLE texas_ids SELECT g.id AS old_id, t.id AS new_id FROM governments g INNER JOIN texas_temp t ON g.name = t.name AND t.alt_type = g.alt_type');

        $this->addSql('SET foreign_key_checks = 0');
        $this->addSql('UPDATE texas t INNER JOIN texas_ids ti ON ti.old_id = t.government_id SET t.government_id = ti.new_id');
        $this->addSql('UPDATE governments g INNER JOIN texas_ids ti ON ti.old_id = g.id SET g.id = ti.new_id');
        $this->addSql('SET foreign_key_checks = 1');
//        $this->addSql('DROP TABLE texas_temp');
        $this->addSql('DROP TABLE texas_ids');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
    }
}
