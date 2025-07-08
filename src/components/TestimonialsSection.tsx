import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Callightman',
      role: 'Product Owner',
      content: 'Great work, great script, well explained video and documentation in details. Got the script today and uploaded myself. Keep up the good work!',
      rating: 5
    },
    {
      name: 'Oriero CM',
      role: 'Customer',
      content: 'They have a good customer support system. It can be improved but it\'s still good enough. Keep it up',
      rating: 4
    },
    {
      name: 'Zainjanii',
      role: 'CEO',
      content: 'Great customer support! I recommend the service they provide. All is working as expected! Keep going!',
      rating: 5
    },
    {
      name: 'Claudivam',
      role: 'CEO',
      content: 'I make my recommendation here. In addition to a mega and dedicated support, the perfect and objective software, showered with numerous resources to automate customer accounts.',
      rating: 5
    },
    {
      name: 'Othmane Bensaid',
      role: 'Product Owner',
      content: 'Amazing support.. They installed the script in my cPanel quickly and for free. Great admin dashboard. Easy to control with additional features.',
      rating: 5
    },
    {
      name: 'Abo Shamah',
      role: 'CEO',
      content: 'Tons of work done here! I rarely see new projects with this amount of details and features! Definitely a very powerful and complete script!',
      rating: 5
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-primary">
            Client Testimonials
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            What our clients say about our services and products
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="text-center p-8 shadow-elegant">
                    <CardContent className="space-y-6">
                      {/* Quote Icon */}
                      <div className="flex justify-center">
                        <Quote className="h-12 w-12 text-primary" />
                      </div>

                      {/* Content */}
                      <p className="text-lg text-muted-foreground leading-relaxed italic">
                        "{testimonial.content}"
                      </p>

                      {/* Rating */}
                      <div className="flex justify-center gap-1">
                        {renderStars(testimonial.rating)}
                      </div>

                      {/* Author */}
                      <div className="space-y-1">
                        <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};