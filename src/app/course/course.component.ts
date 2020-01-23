import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Course} from '../model/course';
import {CoursesService} from '../services/courses.service';
import {LessonsDatasource} from '../services/lessons.datasource';
import {MatPaginator, MatSort} from '@angular/material';
import {fromEvent, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';


@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

  course: Course;

  displayedColumns = ['seqNo', 'description', 'duration'];

  dataSource: LessonsDatasource;

  @ViewChild(MatPaginator, {static: false})
  paginator: MatPaginator;

  @ViewChild(MatSort, {static: false})
  sort: MatSort;

  @ViewChild('input', {static: false})
  input: ElementRef;

  constructor(private route: ActivatedRoute,
              private coursesService: CoursesService) {

  }

  ngOnInit() {
    this.course = this.route.snapshot.data['course'];

    this.dataSource = new LessonsDatasource(this.coursesService);

    this.dataSource.loadLessons(this.course.id, '', 'asc', 0, 3);
    // przypisanie do klasycznego MatTableDataSource
    // this.coursesService.findAllCourseLessons(this.course.id).subscribe(lessons => this.dataSource.data = lessons);
  }

  ngAfterViewInit() {

    fromEvent(this.input.nativeElement, 'keyup')
    .pipe(
      debounceTime(150),
      distinctUntilChanged(),
      tap(() => {
          this.paginator.pageIndex = 0;
          this.loadLessonsPage();
        }
      )
    ).subscribe();

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
    .subscribe(
      () => this.loadLessonsPage());
  }

  loadLessonsPage() {
    this.dataSource.loadLessons(this.course.id, this.input.nativeElement.value, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
  }

  /*  searchLessons(value = '') {
      this.dataSource.filter = value.toLowerCase().trim();
    }*/
}
