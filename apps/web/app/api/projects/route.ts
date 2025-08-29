import { NextRequest, NextResponse } from 'next/server'
import { projectService } from '@/lib/project-service'
import { ProjectFormData } from '@/types/project'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      // 获取单个项目
      const project = await projectService.getProject(id)
      if (!project) {
        return NextResponse.json({
          success: false,
          message: 'Project not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        data: project
      })
    } else {
      // 获取项目列表
      const projects = await projectService.getProjects()
      return NextResponse.json({
        success: true,
        data: projects
      })
    }
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch projects'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProjectFormData = await request.json()
    
    // 简单验证
    if (!body.name?.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Project name is required'
      }, { status: 400 })
    }
    
    const newProject = await projectService.createProject(body)
    
    return NextResponse.json({
      success: true,
      data: newProject
    })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create project'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: { id: string } & Partial<ProjectFormData> = await request.json()
    
    if (!body.id) {
      return NextResponse.json({
        success: false,
        message: 'Project ID is required'
      }, { status: 400 })
    }
    
    const { id, ...updateData } = body
    const updatedProject = await projectService.updateProject(id, updateData)
    
    return NextResponse.json({
      success: true,
      data: updatedProject
    })
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to update project'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Project ID is required'
      }, { status: 400 })
    }
    
    await projectService.deleteProject(id)
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to delete project'
    }, { status: 500 })
  }
}