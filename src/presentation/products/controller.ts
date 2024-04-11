import { Request, Response } from "express";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";
import { ProductService } from "../services/product.service";



export class ProductController {
  constructor(
    private readonly productService: ProductService
  ){};

  private handleError = (error: unknown, res: Response) =>{
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({error: error.message});
    } 
    return res.status(500).json({error: 'Internal Server Error'});
  };

  createProduct = (req: Request, res: Response) => {
    const [error, createProducDto] = CreateProductDto.create({
      ...req.body,
      user: req.body.user.id
    });
    if (error) return res.status(400).json({error});
    
    this.productService.createProduct(createProducDto!)
      .then((data) => res.status(201).json(data))
      .catch((error) => this.handleError(error, res));

  };

  getProducts = (req: Request, res: Response) => {
    const {page = 1, limit = 10} = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) return res.status(400).json({error});
    this.productService.getAllProducts(paginationDto!)
      .then((data) => res.json(data))
      .catch((error) => this.handleError(error, res));
  };
}