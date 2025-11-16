/**
 * Mobile response formatter
 * Optimizes API responses for mobile consumption
 */

export interface MobilePaginationOptions {
  page: number
  limit: number
  total: number
  hasMore?: boolean
}

export class MobileFormatter {
  /**
   * Format paginated response for mobile
   * Includes hasMore flag for infinite scroll
   */
  static paginatedResponse<T>(
    data: T[],
    pagination: MobilePaginationOptions,
    options?: {
      includeMetadata?: boolean
      slim?: boolean
    }
  ) {
    const { page, limit, total } = pagination
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    const response: any = {
      success: true,
      data,
      pagination: {
        page,
        limit,
        hasMore,
      },
    }

    // Include full metadata if requested (default for web, optional for mobile)
    if (options?.includeMetadata !== false) {
      response.pagination.total = total
      response.pagination.totalPages = totalPages
    }

    return response
  }

  /**
   * Format single resource response
   */
  static singleResponse<T>(data: T, options?: { message?: string }) {
    return {
      success: true,
      data,
      ...(options?.message && { message: options.message }),
    }
  }

  /**
   * Format error response
   */
  static errorResponse(error: string | string[], statusCode: number = 400) {
    return {
      success: false,
      error: Array.isArray(error) ? error : [error],
      statusCode,
    }
  }

  /**
   * Strip unnecessary fields for mobile (reduce bandwidth)
   */
  static stripFields<T extends Record<string, any>>(
    obj: T,
    fieldsToRemove: string[]
  ): Partial<T> {
    const result = { ...obj }
    fieldsToRemove.forEach((field) => {
      delete result[field]
    })
    return result
  }

  /**
   * Optimize course object for mobile list view
   */
  static optimizeCourseForList(course: any) {
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      thumbnail: this.optimizeImageUrl(course.thumbnail, 'thumb'),
      level: course.level,
      price: course.price,
      averageRating: course.averageRating,
      enrollmentCount: course.enrollmentCount,
      duration: course.duration,
      instructor: course.creator
        ? {
            id: course.creator.id,
            firstName: course.creator.firstName,
            lastName: course.creator.lastName,
          }
        : null,
      category: course.category
        ? {
            id: course.category.id,
            name: course.category.name,
            slug: course.category.slug,
          }
        : null,
    }
  }

  /**
   * Optimize course object for mobile detail view
   */
  static optimizeCourseForDetail(course: any) {
    return {
      ...course,
      thumbnail: this.optimizeImageUrl(course.thumbnail, 'medium'),
      coverImage: this.optimizeImageUrl(course.coverImage, 'large'),
      // Remove large nested objects that should be fetched separately
      enrollments: undefined,
      certificates: undefined,
      reviews: undefined,
    }
  }

  /**
   * Optimize lesson for mobile
   */
  static optimizeLessonForMobile(lesson: any) {
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      duration: lesson.duration,
      orderIndex: lesson.orderIndex,
      isPreview: lesson.isPreview,
      // Don't send full content in list - fetch separately
      hasContent: !!lesson.content || !!lesson.videoUrl,
      videoUrl: lesson.videoUrl,
      videoDuration: lesson.videoDuration,
    }
  }

  /**
   * Optimize image URL with size parameter
   * In production, this would integrate with CDN/image service
   */
  static optimizeImageUrl(url: string | null | undefined, size: 'thumb' | 'medium' | 'large' = 'medium'): string | null {
    if (!url) return null

    // For now, just return the URL
    // In production, append size query param for CDN processing
    // e.g., url + '?size=' + size
    return url
  }

  /**
   * Format sync response for offline-first apps
   */
  static syncResponse(data: {
    updated: any[]
    deleted: string[]
    lastSyncTimestamp: number
  }) {
    return {
      success: true,
      data: {
        updated: data.updated,
        deleted: data.deleted,
        syncTimestamp: data.lastSyncTimestamp,
        serverTime: Date.now(),
      },
    }
  }

  /**
   * Batch response for multiple endpoints
   */
  static batchResponse(results: { endpoint: string; data: any; error?: any }[]) {
    return {
      success: true,
      results: results.map((result) => ({
        endpoint: result.endpoint,
        success: !result.error,
        data: result.data,
        error: result.error,
      })),
    }
  }
}
