import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from '../db/db.service';
import { PriceTableService } from './price-table.service';

describe('PriceTableService', () => {
  let service: PriceTableService;
  let dbService: DbService;

  const dbServiceMock = {
    cache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceTableService,
        {
          provide: DbService,
          useValue: dbServiceMock,
        },
      ],
    }).compile();

    service = module.get<PriceTableService>(PriceTableService);
    dbService = module.get<DbService>(DbService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('builds SQL for getPriceTables', async () => {
    dbServiceMock.cache.mockResolvedValueOnce([
      { codTabela: 105, descricao: 'Tabela padrao' },
    ]);

    const result = await service.getPriceTables(1);

    expect(result).toEqual([
      { priceTableId: 105, description: 'Tabela padrao' },
    ]);
    expect(dbService.cache).toHaveBeenCalledWith(
      'SELECT codTabela, descricao FROM Ped.TabelaPreco WHERE codEmpresa=1 AND situacao=1',
    );
  });

  it('builds SQL for getPriceTableProducts', async () => {
    dbServiceMock.cache.mockResolvedValueOnce([
      { codProduto: 11, produto: 'Produto 11', precoTabela: 1999900 },
    ]);

    const result = await service.getPriceTableProducts(1, 105);

    expect(result).toEqual([
      { priceTableId: 105, productId: 11, name: 'Produto 11', price: 19.999 },
    ]);
    expect(dbService.cache).toHaveBeenCalledWith(
      'SELECT codProduto, produto, precoTabela FROM Ped.TabelaPrecoItem WHERE codEmpresa=1 AND codTabela=105',
    );
  });

  it('builds SQL for getPriceTableProduct', async () => {
    dbServiceMock.cache.mockResolvedValueOnce([
      { codProduto: 11, produto: 'Produto 11', precoTabela: 1234500 },
    ]);

    const result = await service.getPriceTableProduct(1, 105, 11);

    expect(result).toEqual({
      priceTableId: 105,
      productId: 11,
      name: 'Produto 11',
      price: 12.345,
    });
    expect(dbService.cache).toHaveBeenCalledWith(
      'SELECT codProduto, produto, precoTabela FROM Ped.TabelaPrecoItem WHERE codEmpresa=1 AND codTabela=105 AND codProduto=11',
    );
  });

  it('throws when product is missing', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    dbServiceMock.cache.mockResolvedValueOnce([]);

    await expect(
      service.getPriceTableProduct(1, 105, 11),
    ).rejects.toBeInstanceOf(NotFoundException);
    consoleSpy.mockRestore();
  });

  it('builds SQL for updatePriceTableProduct', async () => {
    dbServiceMock.cache.mockResolvedValueOnce({});

    const result = await service.updatePriceTableProduct(1, 105, 11, 9.99);

    expect(result).toEqual({ priceTableId: 105, productId: 11, price: 9.99 });
    expect(dbService.cache).toHaveBeenCalledWith(
      'UPDATE Ped.TabelaPrecoItem SET precoTabela=999000 WHERE codProduto=11 AND codTabela=105 AND codEmpresa=1',
    );
  });
});
