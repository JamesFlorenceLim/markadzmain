import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { van_id, operator_id } = await req.json();

  try {
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        OR: [
          { van_id },
          { operator_id }
        ]
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'Van or operator is already assigned' },
        { status: 400 }
      );
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        van_id,
        operator_id
      }
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to add assignment', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { id, van_id, operator_id } = await req.json();

  try {
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        AND: [
          {
            OR: [
              { van_id },
              { operator_id }
            ]
          },
          { id: { not: id } }
        ]
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'Van or operator is already assigned' },
        { status: 400 }
      );
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        van_id,
        operator_id
      }
    });

    return NextResponse.json({ message: 'Assignment updated successfully', assignment: updatedAssignment }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to update assignment', error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const assignments = await prisma.assignment.findMany();
    return NextResponse.json(assignments);
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to retrieve assignments', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    const deletedAssignment = await prisma.assignment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Assignment deleted successfully', assignment: deletedAssignment }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to delete assignment', error: error.message }, { status: 500 });
  }
}