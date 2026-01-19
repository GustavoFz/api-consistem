import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PriceTableController } from './price-table.controller';
import { PriceTableService } from './price-table.service';

describe('PriceTableController', () => {
  let controller: PriceTableController;
  let service: PriceTableService;

  const priceTableServiceMock = {
    getPriceTables: jest.fn(),
    getPriceTableProducts: jest.fn(),
    getPriceTableProduct: jest.fn(),
    updatePriceTableProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceTableController],
      providers: [
        {
          provide: PriceTableService,
          useValue: priceTableServiceMock,
        },
      ],
    }).compile();

    controller = module.get<PriceTableController>(PriceTableController);
    service = module.get<PriceTableService>(PriceTableService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates getPriceTables to service without status', async () => {
    priceTableServiceMock.getPriceTables.mockResolvedValueOnce([]);

    const result = await controller.getPriceTables(1);

    expect(result).toEqual([]);
    expect(service.getPriceTables).toHaveBeenCalledWith(1, undefined);
  });

  it('delegates getPriceTables to service with status', async () => {
    priceTableServiceMock.getPriceTables.mockResolvedValueOnce([]);

    const result = await controller.getPriceTables(1, 1);

    expect(result).toEqual([]);
    expect(service.getPriceTables).toHaveBeenCalledWith(1, 1);
  });

  it('delegates getPriceTableProducts to service', async () => {
    priceTableServiceMock.getPriceTableProducts.mockResolvedValueOnce([]);

    const result = await controller.getPriceTableProducts(1, 105);

    expect(result).toEqual([]);
    expect(service.getPriceTableProducts).toHaveBeenCalledWith(1, 105);
  });

  it('delegates getPriceTableProduct to service', async () => {
    const payload = {
      priceTableId: 105,
      productId: 11,
      name: 'Produto 11',
      price: 9.99,
    };
    priceTableServiceMock.getPriceTableProduct.mockResolvedValueOnce(payload);

    const result = await controller.getPriceTableProduct(1, 105, 11);

    expect(result).toEqual(payload);
    expect(service.getPriceTableProduct).toHaveBeenCalledWith(1, 105, 11);
  });

  it('throws when updating with non-positive price', async () => {
    await expect(
      controller.updatePriceTableProduct(1, 105, 11, { price: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(service.updatePriceTableProduct).not.toHaveBeenCalled();
  });

  it('delegates updatePriceTableProduct to service', async () => {
    const payload = { priceTableId: 105, productId: 11, price: 9.99 };
    priceTableServiceMock.updatePriceTableProduct.mockResolvedValueOnce(
      payload,
    );

    const result = await controller.updatePriceTableProduct(1, 105, 11, {
      precoTabela: 9.99,
    });

    expect(result).toEqual(payload);
    expect(service.updatePriceTableProduct).toHaveBeenCalledWith(
      1,
      105,
      11,
      9.99,
    );
  });
});
