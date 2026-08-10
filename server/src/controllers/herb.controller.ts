import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { sendSuccess, sendError } from '../lib/response'
import { herbSchema } from '../lib/validators'

// ─── Controllers ─────────────────────────────────────────

export async function createHerb(req: Request, res: Response): Promise<void> {
  try {
    const validation = herbSchema.safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const herbData = validation.data

    const existing = await prisma.herb.findUnique({
      where: { botanicalName: herbData.botanicalName },
    })

    if (existing) {
      sendError(res, 'An herb with this botanical name already exists.', 409)
      return
    }

    const herb = await prisma.herb.create({
      data: herbData,
    })

    sendSuccess(res, 'Herb created successfully.', { herb }, 201)
  } catch (error) {
    console.error('Create herb error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function updateHerb(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string

    const validation = herbSchema.partial().safeParse(req.body)
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const herb = await prisma.herb.findUnique({ where: { id } })
    if (!herb) {
      sendError(res, 'Herb not found.', 404)
      return
    }

    const updatedHerb = await prisma.herb.update({
      where: { id },
      data: validation.data,
    })

    sendSuccess(res, 'Herb updated successfully.', { herb: updatedHerb })
  } catch (error) {
    console.error('Update herb error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getAllHerbs(req: Request, res: Response): Promise<void> {
  try {
    const herbs = await prisma.herb.findMany({
      orderBy: { commonName: 'asc' },
    })

    sendSuccess(res, 'Herbs retrieved successfully.', { herbs })
  } catch (error) {
    console.error('Get herbs error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}

export async function getHerbById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string

    const herb = await prisma.herb.findUnique({
      where: { id },
    })

    if (!herb) {
      sendError(res, 'Herb not found.', 404)
      return
    }

    sendSuccess(res, 'Herb retrieved successfully.', { herb })
  } catch (error) {
    console.error('Get herb error:', error)
    sendError(res, 'Internal server error.', 500)
  }
}
