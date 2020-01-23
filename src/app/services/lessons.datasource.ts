import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {Lesson} from '../model/lesson';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {CoursesService} from './courses.service';
import {catchError, finalize} from 'rxjs/operators';

export class LessonsDatasource implements DataSource<Lesson> {

  private lessonsSubject = new BehaviorSubject<Lesson[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ =  this.loadingSubject.asObservable();

  constructor(private coursesService: CoursesService) {
  }

  connect(collectionViewer: CollectionViewer): Observable<Lesson[] | ReadonlyArray<Lesson>> {
    return this.lessonsSubject.asObservable();
  }

  loadLessons(courseId: number, filter: string, sortDirection: string, pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);
    this.coursesService.findLessons(courseId, filter, sortDirection, pageIndex, pageSize)
    .pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
    .subscribe(lessons => this.lessonsSubject.next(lessons));
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.lessonsSubject.complete();
    this.loadingSubject.complete();
  }

}
