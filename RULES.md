# Grid Kick Rules

Grid Kick is a round-based football/soccer board game inspired by classic tabletop games. The core mechanic uses a hexagonal grid (13 columns × 15 rows) representing a soccer field.


## The Board

The pitch is laid out on a flat-top hex grid. Use a two-axis coordinate system aligned to the hexes: one axis runs left-to-right across columns, and the other runs top-to-bottom along the grid with the standard hex-column stagger (adjacent columns are vertically offset by half a hex). Each hex is identified by its column and row position in that staggered layout. From any hex, there are six adjacent neighbors: left, right, and four diagonals that follow the hex edges.

Field markings follow standard soccer geometry: goals sit centered on the top and bottom edges of the pitch. The penalty boxes are the rectangular areas directly in front of each goal, spanning inward from the goal line. A single horizontal midline runs across the center of the field, dividing it into top and bottom halves.


## Pregame 

Each User has a Team of four field player.
Each Field Player has a name and an Skillset containing: Speed, Shoot, Passing, Dribbling, Defense, Physics. 

Each User decides for a side of the field and place all its players in its own half (along row 4 respectively row 10). they must attack the goal on the other end of the field.

One user is randomly selected. This player can place the ball mark at any hex along the middleline, then the other user will start with the first round.


## Fields

Fields are the hexagons on the field. Fields have several states depending on who or what stands on that field.

- *Free Field*: Neither a Player nor a Ballmark is on the field.
- *Player Field*: Only a Player is in the field
- *Ball Field*: Only the Ballmark in on the field
- *Player with Ball Field*: A Player and the Ballmark are on this Field

There can never be more then on Player on the same field at the same time.

## Round Loop

A round is the current users turn. A User has basically two actions per round. An action can be one of

- Running
- Passing 
- Discard

After its doing those two actions the other users turn.

### Running
The user can select any field player from its own team and walk as much (free) field as his speed skill. If the player passes a _Ball Field_ on its way the user can decide if the player will pick up the ball. In this case the ball mark will follow the player on every field.

### Passing
The user can select a field player from its own team which is on the same field as the ball mark. He can then choose one of the hex edges an move the ball mark on a straight line for as much (free) fields as his passing skill.

### Discard
Discard the action and do nothing.