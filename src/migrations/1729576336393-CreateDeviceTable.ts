import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateDeviceTable1648372591346 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'device',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                    },
                    {
                        name: 'isAvailable',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'userId',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'rentedAt',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            })
        );

        // Adding Foreign Key
        await queryRunner.createForeignKey(
            'device',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'user',
                onDelete: 'SET NULL', // Define action on delete
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('device');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
        await queryRunner.dropForeignKey('device', foreignKey);
        await queryRunner.dropTable('device');
    }
}
