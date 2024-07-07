import { Component, OnInit } from '@angular/core';
import { delay, of, range, concatMap, BehaviorSubject, take, tap, map, from } from 'rxjs';


const randomDelay = Math.floor(Math.random() * 1000) + 500;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cache-sync-async';

  miniCardsLocalCache: Array<{ programId: string, miniCard: any }> = [];
  miniCardsCacheSubject = new BehaviorSubject(this.miniCardsLocalCache);

  

  ngOnInit(): void {

    const mockRequest = (data: any) => {
      
      console.log(`=============== GET CARD ${data} ==========================`);

      return of('-- CARD ${data}-- ').pipe(
        delay(randomDelay),
        map(() => ({
          programId: data.toString()
        })),
        tap((program) => console.log('-- program: ', program)),
        concatMap((data: any) => this.miniCardsCacheSubject.pipe(
          take(1),
          concatMap(cache => {
            console.log('-- cache', {...cache})
            console.log('-- programs', data)
            const programIdExist = cache.find(value => value.programId === data.programId);

            if (programIdExist) {
              console.log('-- !! CACHE HIT !!')
              return of();
            }

            const mockProgramAssets = of({
              card_visual: `http://placeholder-${data.programId}.jpg`
            }).pipe(delay(randomDelay));

            return mockProgramAssets.pipe(
              map(res => res.card_visual),
              tap(res => {
                console.log(`-- @@ CACHE MISS - GET FROM API FOR ${data.programId} !!`)
                this.miniCardsLocalCache.push({
                  programId: data.programId,
                  miniCard: res
                });
                console.log('-- cache', {...cache})
                this.miniCardsCacheSubject.next(this.miniCardsLocalCache);
                console.log(`-- cache length ${this.miniCardsLocalCache.length}`);
              })
            );
          })
        )),
      );
    };


    from([1, 2, 2, 3]).pipe(
      concatMap((data) => mockRequest(data))
    ).subscribe(response => {
      console.log('subscribe: ', response);
    });
  }



}
