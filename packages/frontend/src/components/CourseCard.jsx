import React from 'react'
import { IconStar, IconClock } from './icons/Icons'

const STATUS_LABELS = {
  active: 'Activo',
  review: 'En revisión',
  draft: 'Borrador',
}

export default function CourseCard({ course, index }) {
  return (
    <article className="db-course-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="db-course-card__thumb" style={{ background: course.accent }} aria-hidden="true">
        <span className={`db-course-card__status ${course.status}`}>
          {STATUS_LABELS[course.status]}
        </span>
      </div>

      <div className="db-course-card__body">
        <h3 className="db-course-card__title">{course.title}</h3>
        <p className="db-course-card__instructor">{course.instructor}</p>

        <div className="db-course-card__meta">
          <span className="db-course-card__rating">
            <IconStar /> {course.rating}
          </span>
          <span className="db-course-card__duration">
            <IconClock /> {course.duration}
          </span>
          <span className="db-course-card__students">
            {course.students.toLocaleString('es-CL')} alumnos
          </span>
        </div>

        <div className="db-course-card__progress">
          <div className="db-progress__track">
            <div className="db-progress__fill" style={{ width: `${course.progress}%` }} />
          </div>
          <span className="db-progress__pct">{course.progress}%</span>
        </div>
      </div>
    </article>
  )
}