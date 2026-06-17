import { Router } from "express";
const router = Router();

import { getData } from "../services/readData.js";

router.get('/course-grid', (req, res) => {

    const coursesData = getData().courses;

    res.render('course-grid', {
            title : 'دوره های آموزشی',
            courseCss : true,
            fontAwesome : true,
            courses: coursesData // taking all of the posts
    });
});


router.get('/:slug', (req, res, next) => {

    const data = getData();

    const course = data.courses.find(c => c.slug === req.params.slug);

    if (course) {
        res.render('course-detail', {
            title: course.title,
            courseCss: true,
            fontAwesome: true,
            course
        });
    } else {
        req.notFoundMessage = 'دوره یافت نشد';
        return next();
    }
});

router.get('/:slug/lesson/:session', (req, res, next) => {

    const data = getData();

    const course = data.courses.find(
        c => c.slug === req.params.slug
    );    

    if(course)
    {
        const sessionNumber = parseInt(req.params.session);
    
        let lesson = null;
    
        for (const section of course.sections) {
            const found = section.lessons.find(
                l => l.session === sessionNumber
            );
    
            if (found) {
                lesson = found;
                break;
            }
        }

        if(lesson)
        {
            res.render('lessons', {
                title: lesson.title,
                courseCss: true,
                fontAwesome: true,
                course,
                lesson
            });
        }else
        {
            req.notFoundMessage = 'جلسه یافت نشد';
            return next();
        }
    }else
    {
        req.notFoundMessage = 'دوره یافت نشد';
        return next();
    }
});
export default router;