import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792859615624 implements MigrationInterface {
  name = 'InitialSchema1792859615624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "btree_gist"`);
    await queryRunner.query(
      `CREATE TYPE "public"."resource_type" AS ENUM('meeting_room', 'vehicle', 'desk')`,
    );
    await queryRunner.query(
      `CREATE TABLE "resources" ("id" SERIAL NOT NULL, "name" character varying(120) NOT NULL, "type" "public"."resource_type" NOT NULL, "capacity" integer NOT NULL, CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE TABLE "reservations" ("id" SERIAL NOT NULL, "start_at" TIMESTAMP WITH TIME ZONE NOT NULL, "end_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "resource_id" integer NOT NULL, CONSTRAINT "XCL_577efe933be49e78ed4b948b34" EXCLUDE USING gist (
    "resource_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
  ), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_867b5da4d2d48942325efa3a828" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_867b5da4d2d48942325efa3a828"`,
    );
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TABLE "resources"`);
    await queryRunner.query(`DROP TYPE "public"."resource_type"`);
  }
}
